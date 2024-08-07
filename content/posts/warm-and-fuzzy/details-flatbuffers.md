---
title: "Details: Why Flatbuffers?"
published: 2020-02-09 10:00
keywords: ["IoT", "AWS", "Lambda", "TypeScript", "Particle", "C++", "Flatbuffers", "DRY"]
---

#### So much complaining

In past posts I have complained about [the pain of setting up CI/CD for Flatbuffers](/posts/warm-and-fuzzy/engineering-system/)
and [the difficulties of using Flatbuffers in React Native](/posts/warm-and-fuzzy/mobile-app/),
requiring me to "re-write" (in practice, reformat) Flatbuffers code into TypeScript.
So why did I bother?

#### Some history

The initial version of the system gave thermostats one setpoint (i.e. the tuple of allowed actions and per-action setpoints, per our [terminology](/posts/warm-and-fuzzy/terminology/))
to chase.
The full configuration for a thermostat consisted of that one setpoint and a few operational parameters like threshold, cadence, etc.
The cloud sent this to the firmware as a reasonably small piece of JSON, e.g.:

```JSON
{"sh":20.0, "sc": 22.0, "th": 1.0, "ca": 60, "aa": "HCR", "xs": "2851861f0b000033"}
```

The firmware parsed the JSON and stored it in a versioned in-memory representation that it also persisted into EEPROM, e.g.:

```cpp
struct ConfigurationData
{
    ConfigurationHeader Header;
    float SetPointHeat;
    float SetPointCool;
    float Threshold;
    uint16_t Cadence;
    Thermostat::Actions AllowedActions;
    OneWireAddress ExternalSensorId;
};
```

So far so good, except the reality of this was a bit painful, given how much I (have to?) care about memory and memory fragmentation on my tiny devices:

- On the cloud side, I abbreviated the JSON by using short-hand properties keys, e.g. `"setPointHeat": 21.5` became `"sh":21.5`.
  This meant that the cloud side needed
  [an explicitly coded per-property translation step](https://github.com/rgiese/warm-and-fuzzy/blob/054fb7f560b2c5a9dc2015811bd1569aea16e425/packages/api/src/shared/firmware/thermostatConfigurationAdapter.ts).
- On the firmware side, I parsed the JSON with [`ArduinoJson`](https://arduinojson.org/) using a mode that makes no heap allocations.
  This requires that I specify the count and names of properties as well as their hierarchy at build time.
  That's [a bit painful](https://github.com/rgiese/warm-and-fuzzy/blob/054fb7f560b2c5a9dc2015811bd1569aea16e425/firmware/thermostat/inc/Configuration.h)
  and not forward-compatible/version-friendly (though, sure, I could add some slop).
- And I visited the parsed JSON to lift it property-by-property into my versioned in-memory store --
  a second explicitly coded per-property translation step, and per-property `struct` fields and accessors needing to be maintained.

#### Codegen'd magic

When the time came to implement scheduled settings (a [pull request](https://github.com/rgiese/warm-and-fuzzy/pull/96) with 139 commits)
I decided to first [do the work](https://github.com/rgiese/warm-and-fuzzy/pull/94) (only 37 commits!) to transmit the thermostat configuration in a better way.
I really wasn't looking forward to adding to the list (and thus fragility) of per-property code in three places (cloud generation, firmware parsing, firmware persistence)
when introducing all the new goop for scheduled settings.

Presto Flatbuffers --
and in the end, expanding the configuration to include scheduled settings was as easy as I'd hoped to be so,
as long as you're not asking me about the engineering systems effort to get it off the ground, I'm a huge fan of Flatbuffers now.

On the cloud side, there's still [an explicitly coded per-property step](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/api/src/shared/firmware/thermostatConfigurationAdapter.ts)
to load the TypeScript-based configuration into Flatbuffers. Unavoidable.

On the firmware side, things have gotten much easier:

- There's no more parsing of any kind. I just double-buffer the config's binary blob and swizzle it into place at an opportune and properly locked point in time.
- There's no more per-property code of any kind since I'm just using the Flatbuffers-code-gen'd accessors.
- Persistence is trivial: I just write the Flatbuffers binary blob to EEPROM, relying on judicious versioning of the Flatbuffers schema to carry me forward.

This don't-repeat-yourself (DRY) magic of schematized data with per-language codegen is what I love about GraphQL and [`graphql-code-generator`](https://github.com/dotansimha/graphql-code-generator)
and the same kind of magic worked wonders here. Domain-specific data description languages and codegen are just the shit.

#### Binary blobs in a texty world

Of course it's never quite that easy.
The path from cloud to firmware goes through the Particle Device Cloud which only accepts text data, not binary,
so I needed to transpose my binary blob into an ASCII-, URL-, and JSON-ish-compatible representation.

I settled on a variant of [Ascii85 encoding](https://en.wikipedia.org/wiki/Ascii85); each group of four binary bytes becomes five ASCII bytes
with a pretty easy accumulate-and-lookup algorithm.
The basic technique can be used with a variety of character sets;
the O.G. Ascii85 character set includes quotes (inconvenient when you're trying to wrap binary data into quoted strings)
so I settled for the [Z85](https://rfc.zeromq.org/spec/32/) character set instead.

Initial testing showed that my system worked fine, _except_ that randomly the push-to-device capability fell over (where I push the latest settings to a Particle Function).
After much debugging it turned out that the Particle Function API fails when the string passed to it contains an ampersand
(and note that this only fails when pushing into a Particle Function, it works fine when Particle is pulling from a webhook and returning the webhook's response to a device).
This isn't documented and there's no good reason for it, but it is what it is.

And what has an ampersand in it? The stock Z85 dictionary of course. So my test data needed to have just the right sequence of bits in it to cause an ampersand to be encoded.

So this is where my pedantic approach to coding paid off somewhat inadvertently.
I'd looked at some [public Z85 code](https://github.com/msealand/z85.node/blob/master/index.js)
and decided to [implement it myself](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/api/src/shared/Z85.ts)
in pure and idiomatic TypeScript instead (rather than something transliterated out of C++).
Since I had my own version, I could easily change the dictionary and use a comma in place of an ampersand.
I had [my own cleaned up C++ implementation](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/firmware/thermostat/inc/Z85.h)
on the firmware side anyhow, so I modified to accept both the ampersand and comma so as a decoder it's cross-compatible with O.G. Z85 and whatever we're doing here.

Don't take that as a suggestion that everyone should fork and re-roll their dependencies, but it did come in handy this time.
It's not like I was ever going to upstream a semi-compatible-at-best protocol change to a public library implementing a public RFC,
so a fork was really the only option.

#### Back to the complaining

A few more words about integrating Flatbuffers into an engineering system,
_a.k.a._ stuff you might want to lift from my code if you're ever using Flatbuffers,
_a.k.a._ stuff you should seriously think about should you ever write a code generator.

**On the C++ side,** the generated code references the environment-provided Flatbuffers library
as if the library code were in a local subdirectory of the generated code.
In other words, the generated file starts with:

```cpp
#include "flatbuffers/flatbuffers.h"
```

In a reasonable C++ build system where I can specify multiple include path roots,
I could easily specify the parent directory of wherever `flatbuffers/` lives as an include root;
however, with the Particle-/cloud-hosted build chain, I cannot.

The solution was [some build-time clowning around](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/firmware/firmware-build-tool/commands/codegen.js)
to rewrite the preamble of the generated code to `#include "flatbuffers.h"` instead of `#include "flatbuffers/flatbuffers.h".

Even more colorfully, the actual `flatbuffers.h` library header plays this same game with _its_ dependencies (`base.h` and `stlemulation.h`)
despite the fact that its dependencies are in the same directory as itself and should have just been included directly (e.g. `#include "base.h"`).

**On the JavaScript/TypeScript side,** the generated code again references the environment-provided Flatbuffers library
as if the library code were alongside the generated code (a theme is emerging).
In other words, the generated file starts with:

```TypeScript
import { flatbuffers } from "./flatbuffers"
```

That doesn't work for me because I direct all my code-generated code into a `generated` directory (the creativity in naming!)
so more [build-time clowning around](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared/codegen-flatbuffers.js)
needed to take place with the JavaScript/TypeScript equivalent of rewriting `import` paths.

**Lesson**: If you're writing a code generator and need to reference external stuff, allow the location of that stuff to be configured at codegen time.

_Note_: There's an `--include-prefix` option on `flatc` but it doesn't seem to do anything for C++ or TypeScript, as far as I can tell.

**Actual happy lesson**: Writing build scripts and tools in JavaScript is actually pretty dope and makes these sorts of hacks less painful.
It's become my favorite build script language over Python, and it's not a write-only-language like Perl.

#### Alternatives considered

Most of the time, rather than getting all fancy up in here, throwing some compression around a thing and hoping for the best
is actually the best approach since that imposes the least amount of complexity on the system.

I put together what I felt was a reasonably sized schedule-based configuration in verbose JSON, i.e. how it's represented in TypeScript.
It came out to around 1524 bytes raw (UTF-8), compressed down to 276 bytes with Brotli (which seems to be the current industry standard),
and inflated to 345 bytes with Ascii85.
The limit on Particle payloads imposed by the Particle OS is 622 bytes, so that made for some pretty good headroom.

However, I'd still need to parse this on the client and transform it into my hand-crafted in-memory representation.
And ~1500 bytes uncompressed (a requisite intermedia stage in the parsing) makes me pretty uncomfortable considering the limits on my heap (~20K and stack space (~5K).

So the move to Flatbuffers made sense to me not just because it saved space on the wire, but moreso because it removed a bunch of complexity and fragility
by codegen'ing marshalling code across languages for me.

Was all that truly necessary for one struct in the entire system? Eh, maybe not, but it makes me happy.
