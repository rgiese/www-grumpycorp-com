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

<?# SimpleFigure src="dmx-case/multiverse-box-open.jpg" caption="Multiverse box, open" /?>

I spent a few design iterations figuring out how to most efficiently stack the power in/out, power supply, and receiver card:

<?# SimpleFigure src="dmx-case/multiverse-box-prototypes.jpg" caption="When at first you don't succeed" /?>

Printing the enclosure out of translucent PETG means I can see the status LEDs while it's running,
loosely pooping out the butt of my company logo:

<?# SimpleFigure src="dmx-case/multiverse-box-on.jpg" caption="Blink if you're happy" /?>

And then for good measure I made six of these:

<?# SimpleFigure src="dmx-case/multiverse-boxes.jpg" caption="Not sure why six but it seemed right at the time" /?>

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

<?# SimpleFigure src="dmx-case/eos.jpg" caption="ETCnomad with a custom magic sheet for my inventory" /?>

...and just like that, the days of unreliable Bluetooth apps are over.
And because this is just Eos, I can remote-control this from any iOS or Android device with any of the Eos-compatible apps.
What a joy to get this software back in my life!

## Step 4: Box up all the things

I bought more of the same/similar gear I've been installing at our local highschool because it's just working so darn well:
A cheap-as-dirt wireless router,
another excellent DMXKing device to translate sACN to wired DMX (the [eDMX4 MAX DIN](https://dmxking.com/artnetsacn/edmx4-max-din) is stunningly compact),
and then my two wireless transmitters.

<?# SimpleFigure src="dmx-case/dmx-case.jpg" caption="Network, DMX, Multiverse, and CRMX all in one place" /?>

The back of the case has three DMX outputs: the first two universes directly, a loop-through of the third universe via the ShowBaby transmitter,
and sadly the Astera BOX swallows the fourth universe (no through port).

In the front is a USB hub with a built-in Ethernet adapter to connect my laptop to the wireless router, host my ETCnomad license key,
and also give me a place to plug in my customized [XKeys keyboard](https://xkeys.com/xk60.html) that mimics the ETC console keypad more or less -
sadly this is pretty much a necessity because the keyboard shortcuts for ETCnomad are nonsensical and thus impossible to remember.

<?# SimpleFigure src="dmx-case/eos-keyboard.jpg" caption="Eos keyboard courtesy of XKeys" /?>

And here is the whole happy family of gadgets sitting side-by-side on my cart (with the assumption that the actual DMX case gets tossed on the lower shelf
while on set):

<?# SimpleFigure src="dmx-case/eos-happy-family.jpg" caption="The whole Eos happy family in one place" /?>

Off to the next project! (And hopefully sooner or later, an actual dang film set again.)
