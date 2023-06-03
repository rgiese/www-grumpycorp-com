---
title: "Tooling and testing for Particle firmware"
published: 2020-02-09 12:00
tags: ["warm-and-fuzzy"]
keywords: ["IoT", "Particle", "C++"]
---

### Particle tooling

After originally building and deploying the Particle firmware code from my desktop,
I wanted to get proper CI/CD put in place for it.

The Particle CLI let me do most of what I wanted but not quite all,
so I stood up a [small collection of helper scripts](https://github.com/rgiese/warm-and-fuzzy/tree/master/packages/firmware/firmware-build-tool/commands)
in JavaScript based on the [`oclif`](https://oclif.io/) command-line framework.

Creating a custom [build](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/firmware/firmware-build-tool/commands/build.js) script
wrapped around the [`particle-api-js`](https://github.com/particle-iot/particle-api-js) library
let me do nice things like excluding test code from firmware compilation.

Creating a custom [upload](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/firmware/firmware-build-tool/commands/upload.js) script
wrapped around `curl` (yeah yeah) let me solve one part of Particle's aggravating approach to versioning:
firmware has a `uint16_t` `PRODUCT_VERSION` that must be defined at build time and then provided at upload time, even though it's also encoded in the binary.
My script scans the source file for the definition of `PRODUCT_VERSION` and uses that to formulate the right API call.
It'd still be nicer if this could all be more free-form (e.g. allow for `git` commit SHAs as a version ID) but this makes it at least somewhat less painful.

_Side note_: You'll still see various one-off "whoops, I forgot to increment the PRODUCT_VERSION" commits in the codebase. Eesh.

### Particle testing

I don't write a lot of test code, but when I do, I have to mock stuff out.
The firmware tests are primarily to [test the setpoint scheduler](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/firmware/thermostat/tests/ThermostatSetpointScheduler.cpp)
as well as minor primitives like [the queue type](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/firmware/thermostat/tests/FixedQueue.cpp)
underlying all reporting back to the cloud.

Since this is C++, I chose [`catch2`](https://github.com/catchorg/Catch2) as the test harness and it's been lovely.

I stood up [a whole bunch of mocks](https://github.com/rgiese/warm-and-fuzzy/tree/master/packages/firmware/thermostat/tests/mocks)
for all the stuff provided by the Particle environment that either I needed to control (like time) or just needed to be able to compile.
It's a little surprising that there isn't already a ready-to-go version of this sort of stuff provided by Particle themselves.

Since I'd previously made `gcc` available from the Flatbuffers exercise, it was easy to compile and run this code as part of CI/CD
using yet another custom [test](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/firmware/firmware-build-tool/commands/test.js) script
-- easier than doing it in `package.json`.

I don't think I actually caught any bugs in the firmware code with these tests but I do feel a lot better knowing this complex bit of logic
does have decent test coverage since -- unlike with just about all the other code which really just transports data from here to there --
the scheduler logic would fail in more subtle ways, particularly in ways that may lead to angry housemates.
