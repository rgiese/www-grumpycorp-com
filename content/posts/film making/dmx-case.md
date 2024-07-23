---
title: Magical DMX case of wonders
published: 2023-12-27
---

The same shoots that kicked off the [grip truck](/posts/film%20making/grip-truck) redo also kicked off my quest for better on-set lighting control.

I'm primarily invested in the Aputure ecosystem of film lighting and the ETC Source4 ecosystem of stage lighting.

Aputure lights can be controlled over Bluetooth using their proprietary apps; many of their lights accept wired DMX input; and newer ones support wireless DMX over CRMX.

ETC lights (my Series3 LEDs at any rate) accept wired DMX input as well as wireless DMX over City Theatrical's Multiverse.

On the more complex of the shoots I used Aputure COB lights (a 300X, I think), panel lights (Nova P300c), mats (F22c), and bulbs (B7c)
because we had the opportunity to tent the space from the outside and shape our own lighting soup-to-nuts without having to worry about daylight shifting on us.

The Aputure Bluetooth app (on a recent vintage iPad) performed somewhere between "poorly" and "terribly", particularly when it came to controlling their bulbs:
they'd randomly unpair, forget the names I'd assigned them, etc. - all in all, it was not pretty.
My inner control freak wanted to get back the level of control I get in [theater work](/posts/theater/the-odyssey) so it was time to build some things.

## Step 1: Multiverse all the things

My Source4 Series3 lights have built-in receivers for City Theatrical's Multiverse standard so it seemed reasonable to buy into that ecosystem.
It's another one of those inexplicable film (CRMX) vs. theater (Multiverse) divides, but sure, since I've been doing a lot of theater work again of late,
let's lean into the theater side of the world.

City Theatrical makes a device called a [ShowBaby](https://www.citytheatrical.com/products/electronic/multiverse-wireless-dmx-rdm/multiverse-show-baby)
that functions as a single universe transceiver depending on what you plug into it - easy!

This works great for my Series3 LEDs, but it's a bit of a pain to wrangle for my film lights: they take their power in over Neutrik's TRUE1
(or coming from Edison using their provided cable) and the ShowBaby requires its own wall wart power adapter, so any (cluster of) light(s)
would need to break out another Edison for said wall wart. I decided to give into my obsession with on-set efficiency and designed an all-in-one box
that takes power in and through, forwards power out to the given light, and has a built-in power supply for the ShowBaby.

Except I don't even need to wrap this around an actual ShowBaby, I can just buy their
[Multiverse receiver card](https://www.citytheatrical.com/products/electronic/multiverse-wireless-dmx-rdm/multiverse-receiver-card) and save on space and money!
The power supply is a [random 12V buck power supply](https://www.amazon.com/dp/B07FNJZ1PR?ref=ppx_yo2ov_dt_b_product_details&th=1) from Amazon.

::figure[Multiverse box, open]{src="dmx-case/multiverse-box-open.jpg"}

I spent a few design iterations figuring out how to most efficiently stack the power in/out, power supply, and receiver card:

::figure[When at first you don't succeed]{src="dmx-case/multiverse-box-prototypes.jpg"}

Printing the enclosure out of translucent PETG means I can see the status LEDs while it's running,
loosely pooping out the butt of my company logo:

::figure[Blink if you're happy]{src="dmx-case/multiverse-box-on.jpg"}

And then for good measure I made six of these:

::figure[Not sure why six but it seemed right at the time]{src="dmx-case/multiverse-boxes.jpg"}

Some administrative notes about Multiverse:

- Multiverse has a newer (`24000`+) and older (`100`+) set of "addresses".
  I'm running on one of the newer ones for (theoretically) better signal quality and potentially more parallel universes, should I need them.
- Programming the ShowBaby's address to any of the newer addresses is a massive pain in the ass: I needed to connect it directly to my aging ETC Element board
  so I could configure its address over RDM.
  City Theatrical, please give these damn things a USB port for configuration access...

## Step 2: CRMX all the things

So far so good but it turns out an ever-increasing percentage of my Aputure inventory has built-in CRMX. Time to also get into the CRMX universe!

Given the nightmarish experience with the B7c bulbs and their inability to consume DMX in any other way, I fired them and upgraded to Astera NYX bulbs instead
with, you guessed it, built-in CRMX. At that point it was only natural to get an Astera BOX as my CRMX transmitter.

## Step 3: Eos all the things

When I started down this path (well over a year ago), the film industry standard for iPad lighting control apps (Blackout) didn't support fixtures that color-mixed
more than just RGB/RGBW and my Source4's have eight different colors (DrRALGCBI I guess?).
The only platform that could meaningfully control that at that time was ETC's family of Eos lightboards, which I already love anyway from decades of theater work.

Thankfully you can now run ETC boards on a laptop with [ETCnomad](https://www.etcconnect.com/ETCnomad/):

::figure[ETCnomad with a custom magic sheet for my inventory]{src="dmx-case/eos.jpg"}

...and just like that, the days of unreliable Bluetooth apps are over.
And because this is just Eos, I can remote-control this from any iOS or Android device with any of the Eos-compatible apps.
What a joy to get this software back in my life!

## Step 4: Box up all the things

I bought more of the same/similar gear I've been installing at our local highschool because it's just working so darn well:
A cheap-as-dirt wireless router,
another excellent DMXKing device to translate sACN to wired DMX (the [eDMX4 MAX DIN](https://dmxking.com/artnetsacn/edmx4-max-din) is stunningly compact),
and then my two wireless transmitters.

::figure[Network, DMX, Multiverse, and CRMX all in one place]{src="dmx-case/dmx-case.jpg"}

The back of the case has three DMX outputs: the first two universes directly, a loop-through of the third universe via the ShowBaby transmitter,
and sadly the Astera BOX swallows the fourth universe (no through port).

In the front is a USB hub with a built-in Ethernet adapter to connect my laptop to the wireless router, host my ETCnomad license key,
and also give me a place to plug in my customized [XKeys keyboard](https://xkeys.com/xk60.html) that mimics the ETC console keypad more or less -
sadly this is pretty much a necessity because the keyboard shortcuts for ETCnomad are nonsensical and thus impossible to remember.

::figure[Eos keyboard courtesy of XKeys]{src="dmx-case/eos-keyboard.jpg"}

And here is the whole happy family of gadgets sitting side-by-side on my cart (with the assumption that the actual DMX case gets tossed on the lower shelf
while on set):

::figure[The whole Eos happy family in one place]{src="dmx-case/eos-happy-family.jpg"}

Off to the next project! (And hopefully sooner or later, an actual dang film set again.)

# Addendum (five months later)

After using this setup on two film shoots, I wanted to make some modifications and upgrades.

### Better wireless

The cheap-as-dirt wireless router did not provide a durable backbone for my iPad or phone to connect to EOS with: they kept losing their connection
and the reconnection would take long (10+ seconds), which is time I do not have when I'm just trying to cheat a light up or down real fast.

I replaced the router with a Ubiquiti [Unifi Express router/AP combo](https://techspecs.ui.com/unifi/unifi-cloud-gateways/ux) paired with a
Ubiquiti [Flex Mini switch](https://store.ui.com/us/en/collections/unifi-switching-utility-mini/products/usw-flex-mini) and it is now much more stable.

I also added a GL.iNet "travel router" (a GL-SFT1200, whatever was cheap on Amazon that day)
to provide an uplink to whatever local WiFi I might want to chain my network to
so my production network can also provide internet access, behind the Unifi Express router's firewall.

On some level that's a bit of a luxury; however, the iPad app I use to remote-control EOS wants to re-authorize itself via the app store every so often
and it does not spark joy to have to hop between a private production network and tethered internet while trying to get the first setup of the day off the ground.
Hopefully this somewhat elaborate setup fixes that, assuming I can remember how to attach the GL.iNet router to new wifi networks...

### Better EOS control

I added a [MidiFighter Twister](https://www.midifighter.com/#Twister) controller that offers knobs for intensity, color, and most importantly, pan/tilt,
addressing a long-standing gripe I've had with using EOS Nomad (or my EOS Element console) with moving lights.

The fairly excellent [TwisterEos](https://en.nolaskey.com/twistereos) freeware interfaces the controller into EOS via OSC.

### Stand-alone computer

I wanted to have the case be fully stand-alone rather than requiring an external laptop because not every shooting location allows me to roll in
with my Inovativ cart with the nice laptop stand, and I don't trust my MacBook Pro to just sort of _float around_ freely outside of that setup.

I ended up buying a darling little Surface Pro 9 tablet because I love having a touchscreen for Nomad
and the Surface was the (relatively) cheapest way of achieving a 4K display with touch support.
