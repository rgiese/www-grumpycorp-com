---
title: "Details: Units of measurement"
published: 2020-02-08 20:00
tags: ["warm-and-fuzzy"]
keywords:
  [
    "IoT",
    "React",
    "ReactNative",
    "TypeScript",
    "GraphQL",
    "Units",
    "Temperature",
  ]
---

#### Experience the experience

One of us in the house (who is wrong) prefers to see temperatures in Fahrenheit (eww).
With my (obviously boundless) empathy engaged, I put together a shwifty UI, as shown previously:

<?# SimpleFigure src="images/webapp-preferences.png" caption="You can have preferences and still be wrong" /?>

Wowsers.

#### Plumbing preferences

As [described previously](/posts/warm-and-fuzzy/webapp/),
I now have a [`UserPreferencesStore`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/stores/userPreferences/index.ts)
that hands me the following as per my [GraphQL schema](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared/src/schema/schema.graphql):

```graphql
#
# UserPreferences
#

enum TemperatureUnits {
  Celsius
  Fahrenheit
}

type UserPreferences {
  temperatureUnits: TemperatureUnits!
}

input UserPreferencesUpdateInput {
  temperatureUnits: TemperatureUnits
}
```

Ok, now what?

#### Strongly type all the things

I decided to create custom types for the measurements I cared to represent (`Temperature` and, partially needlessly but to prove a point, `RelativeTemperature`).

The types inherit from a [`CustomUnitType`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/CustomUnitType.ts)
contract for their member and static types, folding together the notions of (scalar) unit conversion (`{from,to}PreferredUnits` below) and presentation (`toString` and `unitsToString` below).
Separating the concerns of conversion and presentation seemed like it would create more complexities than it would solve problems, so here we are.

Attentive viewers will see that there is only a `T` generic parameter, rather than providing both (e.g.) `TFundamental` and `TPreferred`.
We are making the assumption that the base type will be the same and generally be `number`.
Again, separating those types seemed like it would create more complexities than it would solve problems.

```TypeScript
export interface CustomUnitTypeMembers<T> {
  //
  // Conversion capabilities as members when boxing is required for type detection
  //

  toPreferredUnits(userPreferences: UserPreferences): T;

  toString(userPreferences: UserPreferences): string;
}

export interface CustomUnitTypeStatics<T> {
  //
  // Conversion and presentation capabilities as statics for optimized use
  //

  fromPreferredUnits(value: T, userPreferences: UserPreferences): T;

  toPreferredUnits(value: T, userPreferences: UserPreferences): T;

  toString(value: number, userPreferences: UserPreferences): string;

  unitsToString(userPreferences: UserPreferences): string;
}
```

By convention, `toString()` returns the converted value including its units.
Separating a value from its unit specifier is dangerous whether it's a UI or math by pen-and-paper
so it felt like a good idea to also keep this closely connected in code here.
The `unitsToString` function is used only once, to create a label for an input field.

The [`Temperature`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/Temperature.ts) implementation
is pretty straight-forward:

```TypeScript
import { CustomUnitTypeMembers, CustomUnitTypeStatics } from "./CustomUnitType";
import { TemperatureUnits, UserPreferences } from "./generated/graphqlClient";

// static implements CustomUnitTypeStatics<number> (see below)
export class Temperature implements CustomUnitTypeMembers<number> {
  public valueInCelsius: number;

  public constructor(valueInCelsius: number) {
    this.valueInCelsius = valueInCelsius;
  }

  //
  // Conversion and presentation capabilities as statics for optimized use
  //

  public static fromPreferredUnits(
    valueInPreferredUnits: number,
    userPreferences: UserPreferences
  ): number {
    if (userPreferences.temperatureUnits === TemperatureUnits.Fahrenheit) {
      return ((valueInPreferredUnits - 32.0) * 5.0) / 9.0;
    }

    return valueInPreferredUnits;
  }

  public static toPreferredUnits(valueInCelsius: number, userPreferences: UserPreferences): number {
    if (userPreferences.temperatureUnits === TemperatureUnits.Fahrenheit) {
      return (valueInCelsius * 9.0) / 5.0 + 32.0;
    }

    return valueInCelsius;
  }

  public static toString(valueInCelsius: number, userPreferences: UserPreferences): string {
    return (
      Temperature.toPreferredUnits(valueInCelsius, userPreferences).toFixed(1) +
      Temperature.unitsToString(userPreferences)
    );
  }

  public static unitsToString(userPreferences: UserPreferences): string {
    if (userPreferences.temperatureUnits === TemperatureUnits.Fahrenheit) {
      return "\u00B0F";
    }

    return "\u00B0C";
  }

  //
  // Conversion capabilities as members when boxing is required for type detection
  //

  public toPreferredUnits(userPreferences: UserPreferences): number {
    return Temperature.toPreferredUnits(this.valueInCelsius, userPreferences);
  }

  public toString(userPreferences: UserPreferences): string {
    return Temperature.toString(this.valueInCelsius, userPreferences);
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore TS6133 /* declared but its value is never read */
const _customUnitTypeStaticsValidation: CustomUnitTypeStatics<number> = Temperature;
```

Note that there's some TypeScript magic required to ensure that our final type implements both the member and static functions we desire.

The member stuff is just standard `implements`. To coalesce:

```TypeScript
// Centrally defined
export interface CustomUnitTypeMembers<T> {
  toPreferredUnits(userPreferences: UserPreferences): T;
}

export class Temperature implements CustomUnitTypeMembers<number> {
  public toPreferredUnits(userPreferences: UserPreferences): number {
    ...
  }
  ...
}
```

To also enforce that the static functions are defined correctly,
we assign an instance of the class to a variable we've strongly typed to the desired interface;
if the class doesn't define the right static methods, this will cause compiler trouble.

This is another one of those places where TypeScript/JavaScript's "what even is an object" quandary
(and "what even is a type" to boot) melts my brain. But hey, this works and it makes mostly maybe sense.
(Rarely have I missed C++ metaprogramming as much as when I try to do advanced TypeScript.)

To coalesce:

```TypeScript
export interface CustomUnitTypeStatics<T> {
  fromPreferredUnits(value: T, userPreferences: UserPreferences): T;
  ...
}

export class Temperature implements /* doesn't matter right now */ {
  public static fromPreferredUnits(
    valueInPreferredUnits: number,
    userPreferences: UserPreferences
  ): number {
    ...
  }
}

const _customUnitTypeStaticsValidation: CustomUnitTypeStatics<number> = Temperature;
```

Wowsers.

#### Using strongly typed measurements

For `SortableTable`, [as shown previously](/posts/warm-and-fuzzy/details-sortable-table/),
it's straight-forward to upcast fields to (e.g.) `Temperature` by virtue of `Omit<>` and
the magic of JavaScript object spreading:

```TypeScript
type ThermostatValue = Omit<LatestThermostatValue, "temperature"> & {
  // Type-converted fields
  temperature: Temperature;
};

...

// Project data
const values = latestThermostatValuesStore.data.map(
  (value): ThermostatValue => {
    return {
      ...value,
      // Type-converted fields
      temperature: new Temperature(value.temperature),
    };
  }
);
```

We have nice separation of concerns in that on a per-data-item basis, we just need to create the object;
we'll only need the `UserPreferencesStore` when it's actually time to present, e.g.:

```TypeScript
if (v instanceof Temperature) {
  return v.toString(rootStore.userPreferencesStore.userPreferences);
}
```

The mobile app deals with fewer tables so we just take it as it comes --
I don't bother converting the type of the underlying data and just use the statically provided conversion function:

```TypeScript
{/* Reported temperature */}
<ThemedText.Accent style={styles.detailsText}>
  {Temperature.toString(item.temperature, userPreferences)}
</ThemedText.Accent>
```

#### What's with `RelativeTemperature`?

The initial reason for building [`RelativeTemperature`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/RelativeTemperature.ts)
was to be a bit completist and make the configuration table's temperature threshold (a delta value) display correctly:

<?# SimpleFigure src="images/webapp-configuration.png" caption="Behold the Threshold column" /?>

The edit modal is even so douchey as to say &#X0394;&#X00B0;C...

<?# SimpleFigure src="images/webapp-configuration-modal.png" caption="Gangster units on that Threshold" /?>

Regardless, the place we _actually_ need `RelativeTemperature` is in the setpoint popup
because the dang thing has a spinner that needs to be told how much it should spin up and down by:

<div class="mw6-ns center">

<?# SimpleFigure src="images/webapp-settings-setpoint.png" caption="Changing the setpoint with a spinner" /?>

</div>

So we, for one, have to instruct the spinner input what its step size should be:

```TypeScript
const temperatureStepInCelsius = 1.0; // Round setpoint to multiple of `temperatureStepInCelsius`

...
<Input
  type="number"
  step={RelativeTemperature.toPreferredUnits(
    temperatureStepInCelsius,
    userPreferences
  )}
  ... />
```

Then, whenever the value changes, we need to convert from preferred units back to base units and then
make sure JavaScript hasn't gone off and done some god-awful floating point weirdness because, you know,
asking for a damn integer type is too much to ask.

```TypeScript
const temperatureStepInCelsius = 1.0; // Round setpoint to multiple of `temperatureStepInCelsius`

const roundToMultipleOf = (value: number, roundToMultipleOf: number): number => {
  const numberOfMultiples = value / roundToMultipleOf;
  const roundedNumberOfMultiples = Math.round(numberOfMultiples);
  const roundedToMultiples = roundedNumberOfMultiples * roundToMultipleOf;

  return roundedToMultiples;
};

...
<Input // the same one as above
  onChange={(
    _event: React.ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData
  ): void => {
    const setpointInPreferredUnits = Number.parseFloat(data.value);
    const setpointInBaseUnits = Temperature.fromPreferredUnits(
      setpointInPreferredUnits,
      userPreferences
    );
    const setpoint = roundToMultipleOf(
      setpointInBaseUnits,
      temperatureStepInCelsius
    );

    const updatedSetpoints =
      action === GraphQL.ThermostatAction.Heat
        ? { setPointHeat: setpoint }
        : { setPointCool: setpoint };

    updateMutableSetting({
      ...mutableSetting,
      ...updatedSetpoints,
    });
  }}
  ... />
```

Good times.
