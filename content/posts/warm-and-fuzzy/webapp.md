---
title: "The WarmAndFuzzy web app"
published: 2020-02-02 01:00
keywords: ["IoT", "AWS", "TypeScript", "React", "GraphQL"]
---

## Show me what you got

### Status

The main page gives a quick run-down of what everything is up to (yeah, it's basically a database dump):

<?# SimpleFigure src="images/webapp-home.png" caption="Home page: list of thermostats' and sensors' latest values" /?>

### Settings

The other page any actual human might want to interact with is the thermostat settings page:

<?# SimpleFigure src="images/webapp-settings.png" caption="Thermostat settings" /?>

Each thermostat first lists its holds followed by its schedule steps (sorted by time-of-day).

The approach to editing a setting is heavily inspired by Bret Victor's manifesto
[Magic Ink: Information Software and the Graphical Interface](http://worrydream.com/MagicInk/)
from 2006. I've always wanted to build UI this way but repeatedly was dismissed for wanting to build some sort of "MadLibs" craziness.
Well, for better or worse, there's nobody here to tell me what to do, so here we are.

Every element of a setting (e.g. _Weekdays at 07:00, heat to 24&deg;C_) is clickable and uses a pop-up for editing.
The only thing keeping this from being fully word-based is that I use color-coded iconography instead of "heat to" etc.
since I think it's easier to parse visually and it takes up less space (and it still works for color-blind people).

<div class="mw6-ns center">

<?# SimpleFigure src="images/webapp-settings-days.png" caption="Changing the days on a scheduled setting" /?>

</div>

The system does let you select arbitrary days (e.g. just Mondays and Wednesdays),
but it's also smart enough to collapse the obvious combinations of days into "weekdays", "weekends", and "everyday".

<div class="mw6-ns center">

<?# SimpleFigure src="images/webapp-settings-setpoint.png" caption="Changing the setpoint on a scheduled setting" /?>

</div>

Once a setting is changed, an undo and save button are injected into the setting "bean" for the modified setting:

<div class="mw6-ns center">

<?# SimpleFigure src="images/webapp-settings-setpoint-modified.png" caption="After starting to change a setpoint" /?>

</div>

### Preferences

There's not a lot that folks can adjust about how they experience the system individually;
I have begrudgingly added the ability to experience the system through irrational units (Fahrenheit)
rather than the sane and reasonable system default of Celsius.

<?# SimpleFigure src="images/webapp-preferences.png" caption="You can use Celsius or you can be wrong" /?>

### Configuration

All of the stuff that gets touched during system setup and then never again lives under the `System Configuration` tab
and it looks basically like the database UI that it is, plus proper units annotations.

<?# SimpleFigure src="images/webapp-configuration.png" caption="One-time configuration magic" /?>

This was the first editing UI I created so I'm just phoning it in with a Modal:

<div class="mw6-ns center">

<?# SimpleFigure src="images/webapp-configuration-modal.png" caption="Modal for a single thermostat" /?>

</div>

## How it's built

The web app is built using React and uses [`semantic-ui-react`](https://react.semantic-ui.com/) as its foundational UX element library.
I was tired of everything in the world looking like [Bootstrap](https://react-bootstrap.github.io/) but hadn't quite realized that
`semantic-ui-react` seems to be close to abandoned.
It does work fine, though certain things like its handling of themes and colors is kind of half baked (e.g. you _cannot_ set custom colors for elements).
`++` okay but would not buy again.

### Data and state

The single greatest move forward in the app(s) was to move my data and state into a MobX store, and to generalize GraphQL access via MobX-based helper classes.

Here's how this breaks down:

- [`AuthStore`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/stores/auth/index.ts)
  is a centralized store for maintaining authentication state and tokens.
  - _Side note:_ While `AuthStore` doesn't do the authentication itself, it exposes a reference to an
    [`AuthProvider`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/stores/auth/AuthProvider.ts),
    an interface implemented by the web and mobile app code (different implementations because Auth0 needs different kinds of babysitting in R vs. RN).
    `AuthStore` just acts as a link to `AuthProvider` so that application code has a simple way of (e.g.) requesting logins, etc.
    without me having to stand up yet another React context provider. Anyhow.
- [`StoreBase`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/stores/StoreBase.ts)
  provides the basic structure that any store should follow:
  - An `@observable` `state` enum (`"fetching" | "updating" | "ready" | "error"`).
  - `@computed` semantic accessors for that state so I can expand the state definitions in the future,
    e.g. `isWorking` currently covers `fetching` and `updating`, but could also cover, say, `deleting`, if that became a thing in the future.
  - `error` and `lastUpdated` properties for the obvious.
  - A `name` for debugging purposes.
- [`GraphqlStoreBase`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/stores/GraphqlStoreBase.ts)
  is a templatized (generic) implementation of `StoreBase` for read-only GraphQL-sourced stores.
  It is configured with the type of the stored item and the query.
  - Constructing a MobX-compliant `async` function is pretty extra
    (`private readonly fetchData = flow(function*(this: GraphqlStoreBase<T, TQuery>) {...}`)
    so this was nice to have to do just once.
  - The store sets up a MobX `autorun` in the constructor referencing the auth state from the `AuthStore`.
    If a user logs in, the store automatically fetches data; if a user logs out, it automatically clears itself.
    This chaining of observable state and actions across MobX stores is just hella slick.
  - `GraphqlStoreBase` requires that stored items have an `id` string property and offers a `findItemById` function.
    The function just performs a linear search since our data is so small that I cannot imagine that this is worth doing any better.
  - [`latestThermostatValues`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/stores/latestThermostatValues/index.ts)
    is a good example of a consumer (or rather, actual implementor) of `GraphqlStoreBase`, including its use of `QueryResultDataItemPatcher<T>`
    to fix up return items (rehydrating `Date` types).
- [`GraphqlMutableStoreBase`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/stores/GraphqlMutableStoreBase.ts)
  derives from `GraphqlStoreBase` and provides an `updateItem(id)` function, again leveraging the fact that every item has an `id`.
  - [`ThermostatSettingsStore`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/stores/thermostatSettings/index.ts)
    is a good example of a consumer (or rather, again, actual implementor) of `GraphqlMutableStoreBase`.
- `StoreBase`, to go back to the beginning for a minute, also makes it easy to build a helper like `StoreChecks`,
  a component for the [web](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/webapp/src/components/StoreChecks.tsx)
  and [mobile](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/mobile/src/components/StoreChecks.tsx) apps
  to guard pages/components/etc. that rely on stores to be loaded. It just accepts anything that's a `StoreBase`.
  - The web and mobile implementations are slightly different owing to minor differences between React and ReactNative. Sigh.
- The [`RootStore`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/stores/RootStore.ts)
  owns all of the stores.
- [`useRootStore()`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/stores/RootStoreContext.ts)
  is made available as a React context provider to all components.
- The order of instantiation [at the top level of each app](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/webapp/src/App.tsx)
  is straight-forward:
  - Instantiate an `AuthProvider`.
  - Instantiate an `AuthStore` based on that `AuthProvider`.
  - Inform the `AuthProvider` which `AuthStore` it should push updates into
    - The cross-linking of these two is a bit arbitrary but it allows the `AuthStore` to have a `readonly` reference to the `AuthProvider`, thus this order.
  - Instantiate an [`ApolloClient`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/services/ApolloClient.ts)
    which will auto-inject the access token from the `AuthStore` into each outgoing request and
    use another slick-ass MobX `reaction` (since we didn't need a full-on `autorun`) to clear the Apollo cache whenever a user logs out.
  - Instantiate the `RootStore`.
  - Wrap the app in a `RootStoreContext.Provider`.

This system is really lovely _for this application_. Structurally, it has a few downsides:

- Every store always loads everything.
- Every store always loads all fields (or at least all the fields I ever need across the apps),
  somewhat missing out on one of the premises of GraphQL to let sites of use specify their local minimum set of fields.

However, there just isn't a lot of data in our system to begin with.
Order-of-magnitude of ten thermostats, clients on WiFi, on-the-wire compression - it's just not worth doing better.
Each app (mobile or web) has more or less the same capabilities so they might as well share exactly the same stores.

_Side note:_ The web app is the only place that accesses timeseries data (thermostat and sensor streams);
that access is managed through dedicated stores since they're filtered by the UI and it _is_ high-volume data.

The `Graphql[Mutable]StoreBase` infrastructure is designed for stores of many/multiple items so when it came to build the
[`UserPreferencesStore`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/stores/userPreferences/index.ts)
I had to improvise a bit, since a user only gets a single set of strongly typed preferences.
I used the fixup capabilities of `GraphqlStoreBase` and `GraphqlMutableStoreBase` to respectively inject and remove an `id`
into the type and data of the strongly typed preferences item, and offered it up for consumers through a `@computed` `userPreferences` property.
It's slightly weird but a detailed comment documents it well enough and saves me from hundreds of lines of code duplication.

### Modifying data in the UI

My preferred pattern has become to use `useState` to set up mutable copy of the store item being modified,
using that for `isDirty` detection as well, and then writing back into the store whenever the Save button is pushed.

A simple application of this is for the
[`UserPreferences`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/webapp/src/containers/UserPreferences.tsx) page:

```TypeScript
const UserPreferences: React.FunctionComponent = (): React.ReactElement => {
  const rootStore = useRootStore();
  const authStore = rootStore.authStore;
  const userPreferencesStore = rootStore.userPreferencesStore;

  const userFirstName = authStore.userName?.split(" ")[0];

  const userPreferences = userPreferencesStore.userPreferences;

  const [mutableUserPreferences, setMutableUserPreferences] = useState(userPreferences);
  const [isSaving, setIsSaving] = useState(false);

  const isUserPreferencesDirty = !UserPreferencesSchema.UserPreferencesIsEqual(
    userPreferences,
    mutableUserPreferences
  );

  return (
    <StoreChecks requiredStores={[userPreferencesStore]}>
      <Container style={{ paddingTop: "2rem" }} text>
        <Header as="h4" attached="top" block>
          Let&apos;s get this right for you, {userFirstName}.
        </Header>
        <Segment attached>
          <Form loading={isSaving}>
            <Form.Group>
              <Form.Select
                fluid
                label="Preferred temperature units"
                onChange={(
                  _event: React.SyntheticEvent<HTMLElement>,
                  data: DropdownProps
                ): void => {
                  setMutableUserPreferences({
                    ...mutableUserPreferences,
                    temperatureUnits: data.value as GraphQL.TemperatureUnits,
                  });
                }}
                options={[
                  GraphQL.TemperatureUnits.Celsius,
                  GraphQL.TemperatureUnits.Fahrenheit,
                ].map(
                  (temperatureUnit): DropdownItemProps => {
                    return { key: temperatureUnit, value: temperatureUnit, text: temperatureUnit };
                  }
                )}
                value={mutableUserPreferences.temperatureUnits}
              />
            </Form.Group>
            <Form.Button
              content={isSaving ? "Saving..." : "Save"}
              disabled={!isUserPreferencesDirty}
              icon="save"
              onClick={async (): Promise<void> => {
                setIsSaving(true);
                await userPreferencesStore.updateUserPreferences(mutableUserPreferences);
                setIsSaving(false);
              }}
              positive
            />
          </Form>
        </Segment>
      </Container>
    </StoreChecks>
  );
};

export default observer(UserPreferences);
```

### Other tips and tricks

[React Router](https://reacttraining.com/react-router/) is pretty dope for managing getting around the app.
[`AuthenticatedRoute`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/webapp/src/components/AuthenticatedRoute.tsx)
is a neat little trick for bouncing unauthenticated callers back to the main page.

If you need a cleaner example of interacting with Auth0 than any sample I've been able to find on the internet (if I may say so),
look at [`Auth`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/webapp/src/services/Auth.ts).

## Lessons learned

**Assume that most architecture shown in _Getting started!_-type guides on the internet is not very good.**

The React-ish/Functional-ish programming paradigm seems to still be foreign to many engineers,
which is entirely fair considering that we're all taught imperative languages from the on-set
so the one-directional state flow / single assignment philosophy feels really different.

(I was fortunate to have been taught how to write fairly functional-ish C++ (`const` all the things!)
by a very smart co-worker early on, so this is somewhat more natural to me.)

Once you've wrapped your newly melted brain around React's approach to state
(which they of course ~~keep changing~~ refine their guidance on every six months, bless their hearts)
you have to contend with the reality that dogmatic top-down data flow also doesn't work super-well
past toy scale.

You've got a _logout_ button at the bottom of the UI hierarchy that somehow needs to find the auth component to request a logout,
then the auth component somehow needs to find the GraphQL component to tell it to clear its cache,
and then the GraphQL component (or whatever) needs to find other local stores to erase all their contents,
and then the UI needs to reflorgle itself in the absence of all that data.

It's just a bloody nightmare, and it's no wonder that basically no _Getting started!_ guide gets it right.
They generally get a single part of the system right (logging in or out, _or_ querying data, _or_ storing data)
but tying it all is invariably in danger of becoming spaghetti code.

MobX makes this make sense by allowing for loosely coupled state dependencies that still let each part of the system
be as Functional-ish as it wants to be.

To be clear, WarmAndFuzzy didn't burst onto the scene as a perfectly formed MobX codebase.
I suffered without it for a long time and it was a [pretty painful and lengthy PR](https://github.com/rgiese/warm-and-fuzzy/pull/89)
of 50 commits across 93 changed files to do nothing but make state management not suck.

**Escape hatches are dope.**

The fact that my GraphQL store foundation classes give the implementor the opportunity to transmogrify each item
as it's read or written made it easy to re-use that infrastructure for the `UserPreferencesStore`.
Architecture should be opinionated and purpose-built; further, offering tightly-scoped escape hatches greatly enhances reusability.
JavaScript's Functional-ish pervasive use of lambdas makes it a lot easier to write stateless transform functors
for just this purpose.

(And yes, just because it _should_ be stateless doesn't prevent anyone from passing in something more complex, for better or worse,
but C++ has the same problem. Ah well.)
