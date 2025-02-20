---
title: The importance of terminology
published: 2020-02-01 01:00
keywords: ["IoT", "thermostat", "temperature", "monitoring"]
---

I've finally made it through Step 1 of the [master plan](/posts/warm-and-fuzzy/intro/):

1. Build a replacement thermostat platform that is IoT-enlightened (but otherwise functionally identical) to make real-time temperature data available

That only took nearly a year, though in fairness, I also got to:

5. Build basic mobile app (and web app, for bonus points)

With all of this massive progress achieved (only 67% of the todo list remain!), it's time to journal what I've learned
over a handful of posts.

# Terminology!

## Why I care

I start most projects by first nailing down terminology. The value of doing this cannot be understated.
For one, having to rename stuff partway through a project can be distracting, time-consuming, and merge-conflict-inducing.
More importantly, though, I find that if I cannot nail down the terminology, I don't understand the design well enough to build it.

At the beginning of WarmAndFuzzy I didn't have a particularly great grasp on the technologies I was using
(and also changed tech partway through) so a bunch of changes were required.
That's okay for an experimental project in the beginning but it was worth getting it straightened out
because there's nothing worse than coming back to a side project you haven't touched in weeks (or months)
and finding yourself confused by misaligned or ambiguous word choices that you're now having to trace back and understand.

As of today, 10% of the 842 [commits](https://github.com/rgiese/warm-and-fuzzy/commits/master) to the project
are "gardening" commits that improve naming, formatting, or tech debt without any (intentional) side effects.
It's a major morale boost to get to do that sort of work whenever I feel like it, and to get to come back to a nice codebase
whenever I resume work.

## Show me what you got

The _physical_ | _functional_ antonym'ing below is shamelessly stolen
from [Windows NT](https://stackoverflow.com/questions/19110075/what-is-the-difference-between-pdo-and-fdo-in-windows-device-drivers).

### Let's get physical

- **Devices** are WarmAndFuzzy's physical things. At this time there are two types of devices:
  - **Thermostats** represent the physical and functional things one would intuit them to be.
  - **Sensors** represent anything that can be sensed outside of the intuitive function of a thermostat.
    - In practice, a sensor is used to measure (e.g.) radiant loop temperature.
    - In practice, a sensor is attached to a thermostat (physically and in terms of network topology).
- _Thermostats_ measure things (like temperature) and control things (like heating or cooling).
  - Thermostats can take **actions**, such as _heating_, _cooling_, and _circulating_.
  - Each thermostat has zero or more **available actions**, i.e. they are physically capable of enacting this action.
    - Most thermostats have _heat_ as their only _available_ action because they control radiant heating loops.
    - One thermostat has _heat_, _cool_, and _circulate_ configured as _available_ actions because it controls a heat pump in my living room.
    - One thermostat has no _available_ actions because I'm just using it as an environmental sensor.

### Let's get functional

- Each thermostat can be in pursuit of one **thermostat setting** at a time. Each _setting_ consists of:
  - A list of zero or more **allowed actions** (which must logically be a subset of the _available_ actions of that thermostat).
  - A **setpoint** for each allowed action, i.e. a target temperature to heat or cool to.
    - There currently isn't a target temperature for circulation - if the _circulate_ action is allowed, we'll circulate. Good enough for now.
  - After evaluating current conditions against the current thermostat setting, a thermostat will enact and report its **current actions**.
- There are two **types** of thermostat settings:
  - **Hold** settings specify a timestamp (e.g. 3:45 on January 3rd 2020) until which the setting should be used.
  - **Scheduled** settings specify a time of day and day of week (e.g. Mondays at 8am) at which the setting should be used.
- The **thermostat configuration** defines operational traits of a thermostat that generally don't change, including:
  - its display _name_,
  - the _available actions_ for the thermostat,
  - the **cadence** at which it should report in,
  - the hysteresis **threshold** it should use to smooth out whichever action it's applying,
    - e.g. a threshold of 0.5C and a heat setpoint of 22C means that we'll keep heating until we get to 22.5C and once we're there,
      we won't turn the heat back on until the temperature has dropped down to 21.5C,
  - and the **timezone** the thermostat is located in so we know how to correctly run schedules.

Sensors also have a **configuration** that defines operational traits for sensors (chiefly its display name).

As such, we have the convention that normal people using the system on a day-to-day basis only care about (and see) _settings_
while a system administrator (i.e. me) also sees _configuration_,
and that convention is applied consistently to thermostats and sensors (and whatever else may come in the future).

It matters less that these terms are entirely intuitive (which is hard to achieve) and more that they are consistent
and that antonyms are cleanly established and maintained.

As we'll see later, the settings vs. configuration divide projects cleanly into maintaining different tables (e.g. thermostat settings vs. configuration),
different GraphQL types, different sections of the UI, and different authorized privileges granted to user accounts
to control who gets to change day-to-day system settings (everyone in the house)
and who gets to see and make administrative changes to the system's configuration.

With the terminology set up cleanly, you can look at any piece of code and understand right away whether something is targeting normal people or administrators
without having to further understand what it is. Neat.

### What would you say your value is?

- **Values** are reported for each device at a given time.
  - We track when a value was captured on the device, when it was reported to the cloud, and what its local serial number was (so we can detect power cycles or dropped events).
  - The shape of the recorded value is device-specific:
    - Sensors record temperature (there hasn't been a need to further specialize what a sensor is so mapping _sensor_ == _temperature sensor_ may well bite me in the ass later).
    - Thermostats record temperature, humidity, their ~~wildest dreams and ambitions~~ current setpoint, current actions,
      and operational configuration like threshold and timezone
- **Streams** represent a time series collection of values.
  - Each entry in a stream is a tuple of the stream's name and whatever the given device's value looks like.

Each device configuration specifies the name of the stream its values should be saved into.
Making the stream name configurable independent of the device name and/or ID allows us to:

- Change the display name of device without changing the name of its associated stream to reflect a minor change in name without a fundamental change in function or location,
  allowing us to keep its value history attached to the new name, _or_
- Change the display name of a device _and_ change the name of its stream to reflect a significant change in function or location,
  establishing a new value history.
- Replace a physical device (with the replacement device having a different ID since device IDs are not under our control) and give it the same configuration,
  including the stream name, as the replaced device in order to transparently continue the existing value history.

### Who are you?

Every device has an **id**, a string assigned by whatever manufactured the device
([Particle](https://particle.io) for thermostats, [DalSemi/Maxim](https://www.maximintegrated.com/) for temperature sensors).

### Where do you live?

I built the system as a multi-tenant architecture from the beginning because, plainly, it was easy.

- Every table has the **tenant** as the primary partition key (or includes the tenant in the partition key).
- Every user identity includes a tenant name in its metadata and ID token (JWT).

When a device contacts the API, we need to look up what tenant we should route its data into, so there is one device tenancy table with that mapping.

## Behind the scenes

Every term discussed so far is visible in the user interface (at the very least for administrators).
Every term is used directly, without change, abbreviation, or change in pluralization in the code.

There are a few additional terms I use consistently in or around the code:

- Objects like thermostat configurations are stored in the database, exposed through a GraphQL API, and also passed to the firmware via a webhook.
  They're named identically, just in different TypeScript namespaces and/or classes, so I have a `ThermostatConfiguration` **model** class,
  a `GraphQL.ThermostatConfiguration` **graphql** class, and (when required) a **firmware** representation, projected with typed functions named
  `graphqlFromModel`, `modelFromGraphql` (for mutations), and `firmwareFromModel`.
- Code can be **shared** and placed in a `shared` directory or one of the two `shared` packages. I consistently use the word _shared_ rather than _common_.
- `npm` lifecycle scripts are named and matrixed consistently, e.g. `npm run start{-mobile}:{local,remote}:{dev,prod}` starts
  a web (`start`) or mobile (`start-mobile`) frontend
  using a locally (`local`) or cloud-hosted (`remote`) instance of the API layer, targeting the development (`dev`) or production (`prod`) database.

## Lessons learned

- Be consistent about abbreviating or not abbreviating - it's easiest just to never abbreviate, otherwise it just turns into a mess
  of some terms being abbreviated only some of the time, or some terms getting abbreviated when others don't.
  It's just not worth the confusion and we've got the money for the extra characters.
- The same goes for pluralization. It's best not to pluralize.
  - The table of (e.g.) sensor configurations is the `SensorConfigurationTable`, not the `SensorConfigurationsTable`.
  - Eventually you'll get a table of (e.g.) thermostat settings (wherein each record contains a list with each list item being a thermostat setting),
    so would that pluralize as `ThermostatSettingssTable` with two _s_? No, this ain't Gollum guarding their precious settingses.
- Don't get cute about naming primary identifiers, just call them `id` and get on with it.
  - I hate stuff that works by convention.
    It turns out that by default the [Apollo GraphQL](https://www.apollographql.com/) client-side cache infers item identity from any item property named `id`
    so invalidating/updating cache contents in face of client-originated mutations works like magic, **iff** that's how you name your fields.
    You _can_ of course configure it to treat other property names as identity fields, but if those names get re-used for foreign keys or references rather than primary keys
    you'll be up a creek. Good times.
- When in doubt, be overly specific.
  - For thermostats I have to wrangle timezones. I store the IANA timezone name (e.g. "America/Los_Angeles") in a field named `timezone`
    and project it into a field named `currentTimezoneUTCOffset`, a signed IANA UTC offset (e.g. PST = `480`, i.e. eight hours ahead of UTC).
    Of course the Particle device OS wants to be configured with an inverse signed fractional offset to UTC (e.g. PST = `-8.0`)
    so `currentTimezoneUTCOffset` is projected into `particleTimezone`:

```cpp
void applyTimezoneConfiguration()
{
    //
    // We don't bother telling Particle about DST, we'll just change zones (e.g. PST to PDT)
    // so the above is sufficient. We just need the math to work, we don't need nice formatting.
    //
    // Our configuration tells us the current timezone's offset as well as
    // the next one and when to switch over, in case we don't update frequently.
    //

    bool const inNextTimezone = g_Configuration.rootConfiguration().nextTimezoneChange() <= Time.now();

    // {current,next}TimezoneUTCOffset: signed IANA UTC offset, e.g. PST = 480
    int16_t const timezoneUTCOffset = inNextTimezone ? g_Configuration.rootConfiguration().nextTimezoneUTCOffset()
                                                     : g_Configuration.rootConfiguration().currentTimezoneUTCOffset();

    // particleTimezone: signed fractional hours, e.g. PST = -8.0
    float const particleTimezone = -1.0f * (timezoneUTCOffset / 60.0f);

    // Apply
    Time.zone(particleTimezone);
}
```

Pretty much everything mentioned here is a hard-earned lesson, be it on this project or on previous ones.
