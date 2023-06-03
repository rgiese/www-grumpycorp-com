---
title: WarmAndFuzzy 101
published: 2019-03-16
keywords: ["IoT", "thermostat"]
---

Every day we have to manually mess with heating and cooling in our house, if we want to be environmentally responsible.

I want to make it easier to do The Right Thing by helping us use more energy-efficient ways of controlling our heating and cooling with less effort.

My plan is to create an IoT-based system that does The Right Thing automatically when possible
(e.g. adjusting temperatures by circulating air between spaces)
and asks humans for help when needed (e.g opening/closing windows at the right time) with a notifications-driven app.

## The problem

### Cast of characters

Our heating/cooling menagerie consists of:

- a whole-house hydronic radiant heat system, with per-room thermostats (mostly)
- a forced air heat pump for the common space, to provide heating (backup), cooling, and air circulation
- windows and doors (of course)

We also have a few electric radiant wall panels, in-floor electric heat in one bathroom,
and a ductless heat pump in a single bedroom (artifacts of living with people from Hawaii and Oklahoma, respectively)
but we'll consider these out of scope for now.

### The good stuff

The radiant heat is largely self-maintaining.
The system still doesn't quite work the way I'd like it to, but my complaints are relatively minor;
chiefly, some rooms just don't get warm enough, possibly due to an imperfectly adjusted (flow rates etc.) or designed (loop layout and boiler sizing) system.

The forced air heat pump is a great tool as well.
It's our secret weapon in dealing with our open two-story common space since it can circulate air to even out temperatures -
we can easily get a ten degree differential or more for half the days each year.

And we have plenty of windows and doors for loads of solar heat gain and plenty air circulation.
They're a bit challenging to operate at times (the hardware isn't all that well thought-out)
but the Seattle views and sun (yes, we get plenty of it) and air (generally of a nice and moderate temperature) make them more than worth it.

### The bad stuff

Our most powerful tool for adjusting our environmental conditions - windows and doors - isn't automated at all.

- We open windows when it gets too warm, but by that point it's generally already too warm.
- We forget to close windows at night; then it gets too cold and the heating systems pick up the slack and waste energy.

Our second-most powerful tool - the circulator on the heat pump - isn't automated at all.

- We turn it on when it gets too warm, but by that point it's generally already too warm.
- We forget to turn it off as well (but that's generally not too wasteful since it's reasonably low-energy).

Our basic tools are automated but only in the most basic of ways (e.g. _hold this temperature_).

None of these tools are _tracked_ so we don't really know when we're heating and why (open window? poorly circulated air? cold day?).
Overall energy consumption is measured courtesy of our utility company (gas and electricity to the house) but none of it is attributable
to a system (heating vs. e.g. TV or cooktop) or cause (e.g. window left open at night).
Even when we do better, we don't know how much it improves the situation or whether the improvement was sustained.

## The solution

Technology to the rescue ([sigh](/hire-me/)).

- We have an alarm system that already knows when windows are open in each room.
- We all have phones we can deliver notifications to.
- And we have (non-IoT) thermostats in each room that are remotely 24VAC-powered (courtesy of my [recent re-work](/posts/crafting/radiant-rework/)).
- We have an internet connection to all the cloud resources ever (of course) with [lovely](https://www.ui.com/unifi/unifi-ap-ac-pro/) WiFi coverage everywhere.

I'll stitch this together over a couple of phases:

1. Build a replacement thermostat platform that is IoT-enlightened (but otherwise functionally identical) to make real-time temperature data available
2. Enhance thermostat with cross-thermostat logic, e.g. "turn on air circulation if the temperature delta between upstairs and downstairs exceed three degrees"
3. IoT-ify the alarm system to make window open/close data available in real-time
4. Build basic mobile app to provide real-time system status
5. Build system to infer and deliver notifications for "human help" requests, e.g. "please open/close a window"
6. Build predictive logic, e.g. "please close this window in the next two hours because it will get too cold"

This will allow our system to assist us humans in using the most environmentally responsible ways of heating and cooling the house
and also help us track how well we're doing and how much energy we're consuming.

Oh and I'm calling this project "warm and fuzzy" because `warmandfuzzy.house` was available as a TLD (unused as of yet).

### Roads not taken

Sure, to take humans out of the equation we could just automate our windows. I think that's going to end in tears, and it would require the base infrastructure of at least steps 1 and 2 anyhow,
so let's just get going on those.
