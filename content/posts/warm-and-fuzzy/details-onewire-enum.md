---
title: "Details: OneWire bus enumeration"
published: 2020-02-01 02:30
keywords: ["IoT", "Particle", "OneWire", "enumerate", "search"]
---

I'm using an I2C-based [DS2484](https://www.maximintegrated.com/en/products/interface/controllers-expanders/DS2484.html)
as my OneWire bus controller since bit-banging a 6'/ten-device-long OneWire from GPIO just doesn't work.
The most interesting part of writing support for OneWire on top of this chip ended up being the bus enumeration logic.

OneWire devices have a 64-bit ID lasered into them at manufacturing time. It's not configurable, nor can you inspect it by looking at the physical devices.
Instead, you have to enumerate the bus and be (hopefully pleasantly) surprised by what you find after playing Battleship for every address bit:

- Reset the bus
- Issue a search command
- Issue a "does anyone have an address that starts with zero?" command
  - If nobody answers, nobody does. Try with a one instead.
  - If everybody answers in the affirmative, everybody's address starts with a zero. Proceed to Battleship the next bit.
  - If folks disagree (the one wire of the OneWire bus gets dragged in different directions), continue to the next bit,
    but also return to this bit in the future to try out the opposite value.

To allow for disagreement to be signaled on a single wire bus, devices need to answer with both the value and complement value of their respective bit in subsequent time slots;
if there's disagreement among devices, the responses will fail to complement (one device will drag the line down for the value, another for the complement),
allowing us to sense burgeoning conflict. It's a brilliant and heinous technique, and it's such a common gangster move that the DS2484 even encapsulates
this sort of "triplet" operation in a single I2C command.

This process is described in a venerable [Maxim tech note](https://www.maximintegrated.com/en/design/technical-documents/app-notes/1/187.html).
The tech note is clearly written by firmware programmers with little love for or knowledge of computer science (not that I can claim much of that either)
or good coding practices (which I lay claim to) and it includes a reference implementation that is as widely copied in open-source libraries as it is terrible.

I'll reproduce the meat of their code here:

```C
// method declarations
int  OWFirst();
int  OWNext();
int  OWVerify();
void OWTargetSetup(unsigned char family_code);
void OWFamilySkipSetup();
int  OWReset();
void OWWriteByte(unsigned char byte_value);
void OWWriteBit(unsigned char bit_value);
unsigned char OWReadBit();
int  OWSearch();
unsigned char docrc8(unsigned char value);

// global search state
unsigned char ROM_NO[8];
int LastDiscrepancy;
int LastFamilyDiscrepancy;
int LastDeviceFlag;
unsigned char crc8;

//--------------------------------------------------------------------------
// Find the 'first' devices on the 1-Wire bus
// Return TRUE  : device found, ROM number in ROM_NO buffer
//        FALSE : no device present
//
int OWFirst()
{
   // reset the search state
   LastDiscrepancy = 0;
   LastDeviceFlag = FALSE;
   LastFamilyDiscrepancy = 0;

   return OWSearch();
}

//--------------------------------------------------------------------------
// Find the 'next' devices on the 1-Wire bus
// Return TRUE  : device found, ROM number in ROM_NO buffer
//        FALSE : device not found, end of search
//
int OWNext()
{
   // leave the search state alone
   return OWSearch();
}

//--------------------------------------------------------------------------
// Perform the 1-Wire Search Algorithm on the 1-Wire bus using the existing
// search state.
// Return TRUE  : device found, ROM number in ROM_NO buffer
//        FALSE : device not found, end of search
//
int OWSearch()
{
   int id_bit_number;
   int last_zero, rom_byte_number, search_result;
   int id_bit, cmp_id_bit;
   unsigned char rom_byte_mask, search_direction;

   // initialize for search
   id_bit_number = 1;
   last_zero = 0;
   rom_byte_number = 0;
   rom_byte_mask = 1;
   search_result = 0;
   crc8 = 0;

   // if the last call was not the last one
   if (!LastDeviceFlag)
   {
      // 1-Wire reset
      if (!OWReset())
      {
         // reset the search
         LastDiscrepancy = 0;
         LastDeviceFlag = FALSE;
         LastFamilyDiscrepancy = 0;
         return FALSE;
      }

      // issue the search command
      OWWriteByte(0xF0);

      // loop to do the search
      do
      {
         // read a bit and its complement
         id_bit = OWReadBit();
         cmp_id_bit = OWReadBit();

         // check for no devices on 1-wire
         if ((id_bit == 1) && (cmp_id_bit == 1))
            break;
         else
         {
            // all devices coupled have 0 or 1
            if (id_bit != cmp_id_bit)
               search_direction = id_bit;  // bit write value for search
            else
            {
               // if this discrepancy if before the Last Discrepancy
               // on a previous next then pick the same as last time
               if (id_bit_number < LastDiscrepancy)
                  search_direction = ((ROM_NO[rom_byte_number] & rom_byte_mask) > 0);
               else
                  // if equal to last pick 1, if not then pick 0
                  search_direction = (id_bit_number == LastDiscrepancy);

               // if 0 was picked then record its position in LastZero
               if (search_direction == 0)
               {
                  last_zero = id_bit_number;

                  // check for Last discrepancy in family
                  if (last_zero < 9)
                     LastFamilyDiscrepancy = last_zero;
               }
            }

            // set or clear the bit in the ROM byte rom_byte_number
            // with mask rom_byte_mask
            if (search_direction == 1)
              ROM_NO[rom_byte_number] |= rom_byte_mask;
            else
              ROM_NO[rom_byte_number] &= ~rom_byte_mask;

            // serial number search direction write bit
            OWWriteBit(search_direction);

            // increment the byte counter id_bit_number
            // and shift the mask rom_byte_mask
            id_bit_number++;
            rom_byte_mask <<= 1;

            // if the mask is 0 then go to new SerialNum byte rom_byte_number and reset mask
            if (rom_byte_mask == 0)
            {
                docrc8(ROM_NO[rom_byte_number]);  // accumulate the CRC
                rom_byte_number++;
                rom_byte_mask = 1;
            }
         }
      }
      while(rom_byte_number < 8);  // loop until through all ROM bytes 0-7

      // if the search was successful then
      if (!((id_bit_number < 65) || (crc8 != 0)))
      {
         // search successful so set LastDiscrepancy,LastDeviceFlag,search_result
         LastDiscrepancy = last_zero;

         // check for last device
         if (LastDiscrepancy == 0)
            LastDeviceFlag = TRUE;

         search_result = TRUE;
      }
   }

   // if no device found then reset counters so next 'search' will be like a first
   if (!search_result || !ROM_NO[0])
   {
      LastDiscrepancy = 0;
      LastDeviceFlag = FALSE;
      LastFamilyDiscrepancy = 0;
      search_result = FALSE;
   }

   return search_result;
}
```

Cool, so we've got global state (ugh), multiple entry points (`OWFirst`, `OWNext`) that need to be called in the right sequence (ugh),
a mix of braced and unbraced conditionals (ugh ugh), and a bunch of inlined bit manipulation to twiddle the 64 address bits one at a time (ugh).
For extra style un-points there's even a `do {} while()` loop, the bain of all people who have to actually read code.

After reading the code and reconstituting my now-melted brain, I went back to the drawings provided in the tech note and realized that
we're really just doing a memo-ized breadth-first tree traversal of the tree of possible addresses.
I also realized that if I emitted any live address I found through a callback (e.g. `std::function`) rather than returning for each live address,
I didn't need to port state across invocations and this could become a much more localized piece of code.

(I could have also tossed identified addresses in an array of course
but I didn't want this code to impose memory allocations or memory management policy decisions on the caller.)

With that in mind, here's what I ended up with ([full version](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/firmware/thermostat/onewire/OneWireGateway2484.cpp)):

```cpp
bool OneWireGateway2484::EnumerateDevices(std::function<void(OneWireAddress const&)> OnAddress) const
{
    //
    // For a description of the OneWire enumeration process, see Maxim AN 187
    // at https://www.maximintegrated.com/en/app-notes/index.mvp/id/187.
    //
    // In broad strokes, we reset the bus and issue an enumeration command.
    // Every device on the bus reports the lowest bit of their address
    // by value (`firstBit`) and complement (`secondBit`),
    // allowing us to detect whether multiple devices reported conflicting values
    // for that bit.
    //
    // If the values conflict, we march on in an arbitrarily chosen default direction
    // and remember that we had a conflict at this bit index
    // (wherein "marching on" means sending out a confirmation of the chosen bit value to the devices;
    //  any device whose address disagrees with that bit value drops out of the process until we reset the bus).
    //
    // If the values don't conflict, we save the returned bit and repeat the process for the next bit.
    //
    // Once we've cycled through all 64 bits in a full address,
    // we restart the process if a conflict was detected and choose a different path
    // at the point of conflict.
    //
    uint8_t const c_NotSet = static_cast<uint8_t>(-1);

    OneWireAddress address;
    uint8_t idxPreviousRound_LatestConflictingBit = c_NotSet;

    for (size_t idxAttempt = 0; idxAttempt < 32; ++idxAttempt)  // safeguard against runaway conditions
    {
        uint8_t idxLatestConflictingBit = c_NotSet;

        // Reset bus
        Reset();

        // Check if any devices are present from presence pulse after bus reset
        if (idxAttempt == 0)
        {
            GatewayStatus status;
            RETURN_IF_FALSE(ReadGatewayRegister(status.Value, GatewayRegister::Status));

            if (!status.PresencePulseDetected)
            {
                return false;
            }
        }

        // Issue search command
        RETURN_IF_FALSE(WriteCommand(OneWireCommand::SearchAll));

        for (uint8_t idxBit = 0; idxBit < 64; ++idxBit)
        {
            bool const c_DefaultDirectionOnConflict = false;

            bool const directionOnConflict =
                // If there was no previous conflict...
                (idxPreviousRound_LatestConflictingBit == c_NotSet)
                    ? c_DefaultDirectionOnConflict  // ...move in the default direction.
                    // If we're at a bit prior to a previously conflicting bit...
                    : (idxBit < idxPreviousRound_LatestConflictingBit)
                          ? address.GetBit(idxBit)  // ...follow the same path as before.
                          // If we're at the site of the previously conflicting bit...
                          : (idxBit == idxPreviousRound_LatestConflictingBit)
                                ? !c_DefaultDirectionOnConflict  // ...choose a different path;
                                : c_DefaultDirectionOnConflict;  // otherwise, choose the default direction
                                                                 // again.

            // The triplet operation will evaluate the retrieved bit/complement-bit values
            // for the current address bit and send out a direction bit as follows:
            //   0, 0: a mix of zeros and ones in the participating ROM IDs -> write requested direction bit
            //   0, 1: there are only zeros in the participating ROM IDs -> auto-write zero
            //   1, 0: there are only ones in the participating ROM IDs -> auto-write one
            //   1, 1: invalid condition -> auto-write one
            bool firstBit;
            bool secondBit;
            bool directionTaken;
            {
                RETURN_IF_FALSE(Triplet(firstBit, secondBit, directionTaken, directionOnConflict));
            }

            if (firstBit && secondBit)
            {
                // Invalid condition (device must have gone missing, given initial presence pulse check),
                // abort search
                return false;
            }
            else if (firstBit == !secondBit)
            {
                // No conflict -> accept bit
                address.SetBit(idxBit, firstBit);
            }
            else
            {
                // Conflict -> accept bit from direction taken (should be the same as `directionOnConflict`
                // above)
                address.SetBit(idxBit, directionTaken);

                // Verify internal consistency
                if (directionTaken != directionOnConflict)
                {
                    return false;
                }

                // Remember we saw a conflict if we moved in the default direction (otherwise we don't need
                // to revisit)
                if (directionTaken == c_DefaultDirectionOnConflict)
                {
                    idxLatestConflictingBit = idxBit;
                }
            }
        }

        if (address.IsValid())
        {
            OnAddress(address);
        }

        if (idxLatestConflictingBit == c_NotSet)
        {
            // No conflicts detected -> done finding devices
            return true;
        }

        idxPreviousRound_LatestConflictingBit = idxLatestConflictingBit;
    }

    return false;  // Ran into runaway bounds
}
```
