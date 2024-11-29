---
title: Building out a Pyxis
published: 2024-11-27
---

Some minor tips and tricks from my B-CAM (Blackmagic Design Pyxis) buildout - relatively more restrained
than the [A-CAM](../ursa-cine-buildout/) buildout.

::figure[Full rig]{src="pyxis-buildout/full_rig.jpg"}

::figure[Cheese rod up front]{src="pyxis-buildout/cheese_rod.jpg"}

The Ursa Cine top handle is just fantastic and matches up with the Pyxis and its [XCLS cage](https://www.xlcsdesigns.com/collections/pyxis) perfectly.
I'm experimenting with a cheese rod so I can mount my monitor mount to it directly ("yo dawg" etc.).

::figure[FIZ rod up front]{src="pyxis-buildout/fiz_rod.jpg"}

Top rods are a great place FIZ motors, keeping them out of the way of any lens supports on the bottom rails.

::figure[Back gak]{src="pyxis-buildout/back_rail.jpg"}

The gak in the back consists of:

1. My custom five-way 2-pin Lemo power distribution, screwed into the back of the XLCS cage
2. A Teradek (this one with a custom aluminum plate I milled to adapt its whackadoo bottom hole pattern to a standard 15mm rail block)
3. A Blackmagic 12G-SDI to 4K-HDMI converter (downstream of the Teradek, for the SmallHD 702 monitor, powered by the camera's rear USB)
4. A Tentacle Sync timecode box
5. A SmallRig V-mount battery plate (plus Shark Fin plus batteries)

::figure[Back side]{src="pyxis-buildout/back_side.jpg"}

I routed an additional three-way 2-pin Lemo distributor from Alvin's Cables to the side, for the FIZ system and monitor.

However. Just when I thought I was done 3D-printing for the [Ursa Cine](../ursa-cine-buildout/),
I discovered that the rods on the XLCS cage are set down so much that they interfere
with my [MiniQRB plate](https://cleanscamerasupport.com/product/mini-quick-release-base/)'s mechanism.

I fixed this with a little 3mm spacer plate between the MiniQRB plate and the cage.

::figure[Spacer plate]{src="pyxis-buildout/bottom_spacer.png"}

Feel free to grab [the STL file](bottom_spacer.stl) or [the original Fusion360 f3d](bottom_spacer.f3d) and run your own.
Note that I print these with [black carbon fiber PETG](https://atomicfilament.com/products/carbon-fiber-black-petg-pro) and that holds up pretty well.
