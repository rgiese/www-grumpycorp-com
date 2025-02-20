---
title: "Details: API implementation"
published: 2020-02-01 02:40
keywords: ["IoT", "AWS", "Lambda", "DynamoDB", "Serverless", "TypeScript", "GraphQL"]
---

## Don't repeat yourself

Types should be defined once, in as natural a schema as possible (e.g. TypeScript for data types, GraphQL for GraphQL types).
When projecting types from one domain to another (e.g. database model types to GraphQL types),
the conversion should be automatic and safe while still allowing for fixups for corner cases.
It took some effort to find the right libraries for this in the YOLO-verse that is JavaScript, but it turns out to be possible and in fact pleasant.

For database access, Amazon's [dynamodb-data-mapper-js](https://github.com/awslabs/dynamodb-data-mapper-js) is an awesome piece of kit.

Similarly, [graphql-code-generator](https://github.com/dotansimha/graphql-code-generator) is the bee's knees
when it comes to generating TypeScript definitions from a GraphQL schema.
This makes my resolvers both safe and trivial; any mismatch becomes a compile-time error.

This infrastructure has made it super-simple to introduce new tables and expose them via GraphQL .

### Database access

I can decorate basic TypeScript types using `dynamodb-data-mapper-js` and they magically fly in and out of the database. For example:

```TypeScript
@table("DeviceTenancy")
export default class DeviceTenancy {
  // Device ID (assigned by Particle)
  @hashKey()
  public id: string;

  // Tenant (assigned by WarmAndFuzzy)
  @attribute()
  public tenant: string;

  public constructor() {
    this.id = "";
    this.tenant = "";
  }
}
```

Combine that with the Serverless/CloudFormation definition:

```yaml
Resources:
  DeviceTenancyTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: ${self:custom.dynamoDbTablePrefix}DeviceTenancy
      KeySchema:
        # Partition key
        - AttributeName: id
          KeyType: HASH
      AttributeDefinitions:
        # Partition key
        - AttributeName: id
          AttributeType: S
      BillingMode: PAY_PER_REQUEST
```

...and Bob's your uncle.
Tables that define additional columns just define those inside TypeScript, there's no need to register them in CloudFormation
provided they're not hash (primary) or range (secondary) keys. That is _all there is_ to defining a given table. No SQL, no sprocs, nothing else. It's magical.

Setting up database tables per environment (dev vs. prod) is also reasonably pleasant.
My root [serverless.yml](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/api/serverless.yml)
defines the `stage` (as Serverless calls it) and then creates a custom variable based on that with
`dynamoDbTablePrefix: ${self:custom.stage}.` which gets picked up in the per-table Serverless/CloudFormation snippet shown above.
The same value is plumbed into the `provider` | `environment` via Serverless and then injected into the `DataMapper` from `@aws/dynamodb-data-mapper`
with

```TypeScript
export const DbMapper = new DataMapper({
  client: new DynamoDB({ region: process.env.DYNAMODB_REGION as string }),
  tableNamePrefix: process.env.DYNAMODB_TABLE_NAME_PREFIX as string,
});
```

### Fancifying data access

When I'm just loading a single item at a point of use, this looks pretty simple:

```TypeScript
const deviceTenancy = await DbMapper.getOne(new DeviceTenancy(), { id });
```

based on a generic [mapper](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/api/src/shared/db/DbMapper.ts) like so:

```TypeScript
export interface ObjectWithId {
  id: string;
}

export interface ObjectWithIdAndTenant {
  tenant: string;
  id: string;
}

class DataMapper extends DynamoDBDataMapper {
  public constructor(configuration: DataMapperConfiguration) {
    super(configuration);
  }

  public async getOne<T, TCondition extends ObjectWithId | ObjectWithIdAndTenant>(
    newItem: T,
    condition: TCondition
  ): Promise<T> {
    const item = await this.get<T>(Object.assign(newItem, condition));

    return item;
  }

  public async getBatch<T extends ObjectWithId | ObjectWithIdAndTenant>(
    conditions: T[]
  ): Promise<T[]> {
    const items = new Array<T>();

    for await (const item of this.batchGet(conditions)) {
      items.push(item);
    }

    return items;
  }
}
```

### Interfacing with GraphQL

This gets a little more colorful when I want to map the model types to GraphQL.
[Graphql-code-generator](https://github.com/dotansimha/graphql-code-generator) generates TypeScript definitions from my GraphQL schema
as well as the top-level Query/Mutation types I need to instantiate the Apollo GraphQL server.

My top-level GraphQL [resolvers](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/api/src/graphql/resolvers.ts)
instantiate a per-type resolver (e.g. a [ThermostatConfigurationResolver](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/api/src/graphql/resolvers/ThermostatConfigurationResolver.ts))
which pretty much just instantiates a generic
[MappedResolver](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/api/src/graphql/resolvers/MappedResolver.ts) generic I built while providing specific types and policies.

A brain-twister here is that I need the `MappedResolver` to be able to instantiate a new instance of the type I'm specializing it for.
This is where TypeScript and JavaScript devolve into somewhat existential questions like _what even is a thing_ and _what does it mean to instantiate something_.

The recipe I eventually settled on looks like this (condensed into one place):

```TypeScript
type ZeroArgumentsConstructor<T> = new () => T;

//
// MappedResolver
//

export default class MappedResolver<
  TGraphQL extends TGraphQLCreateInput,
  TGraphQLCreateInput extends object,
  TGraphQLUpdateInput extends ObjectWithId,
  TModel extends ObjectWithIdAndTenant,
  TModelConstructor extends ZeroArgumentsConstructor<TModel>,
  TMapper extends GraphQLModelMapper<TGraphQL, TGraphQLCreateInput, TModel>
> {
  private readonly _modelConstructor: TModelConstructor;
  private readonly _mapper: TMapper;
  private readonly _schema?: yup.ObjectSchema;

  public constructor(
    modelConstructor: TModelConstructor,
    mapper: TMapper,
    schema?: yup.ObjectSchema
  ) {
    this._modelConstructor = modelConstructor;
    this._mapper = mapper;
    this._schema = schema;
  }

  public async getOne<TArgs extends ObjectWithId>(tenant: string, args: TArgs): Promise<TGraphQL> {
    const itemCondition: Pick<TModel, "tenant" | "id"> = { tenant, id: args.id };

    const item = await DbMapper.get(Object.assign(new this._modelConstructor(), itemCondition));

    return this._mapper.graphqlFromModel(item);
  }

  // ...more stuff
}

//
// One of the various sites using MappedResolver
//

// ...wherein `ThermostatConfiguration` is a `dynamodb-data-mapper-js`-annotated model class
const thermostatConfigurationModelConstructor: ZeroArgumentsConstructor<ThermostatConfiguration> = ThermostatConfiguration;

const thermostatConfigurationResolver = new MappedResolver<
  // GraphQL types
  GraphQL.ThermostatConfiguration,
  GraphQL.ThermostatConfigurationCreateInput,
  GraphQL.ThermostatConfigurationUpdateInput,
  // Model type
  ThermostatConfiguration,
  typeof thermostatConfigurationModelConstructor,
  // Mapper
  ThermostatConfigurationMapper
>(
  thermostatConfigurationModelConstructor,
  new ThermostatConfigurationMapper(),
  ThermostatConfigurationSchema.Schema
);
```

I _cannot_ infer the `ZeroArgumentsConstructor<TModel>` inside the `MappedResolver<>` from the provided `TModel` type
because the divide between what is and isn't available at run-time vs. compile-time is brain-melting in TypeScript/JavaScript.
It looks so much like C++ until it really doesn't and it makes one despair.

For separation of concerns, the actual per-item mapping from model to GraphQL types is stashed in a per-type mapper class
and is generally really vanilla (noting that the back-mapping from GraphQL to model types requires injecting the tenant
since I don't include the tenant in the GraphQL type - I wouldn't be able to trust it in updates):

```TypeScript
class SensorConfigurationMapper
  implements
    GraphQLModelMapper<
      GraphQL.SensorConfiguration,
      GraphQL.SensorConfigurationCreateInput,
      SensorConfiguration
    > {
  public graphqlFromModel(rhs: SensorConfiguration): GraphQL.SensorConfiguration {
    const { ...remainder } = rhs;

    return {
      ...remainder,
    };
  }

  public modelFromGraphql(
    tenant: string,
    rhs: GraphQL.SensorConfigurationCreateInput
  ): SensorConfiguration {
    const { ...remainder } = rhs;

    return Object.assign(new SensorConfiguration(), {
      tenant,
      ...remainder,
    });
  }
}
```

It gets a little more interesting when we're mapping arrays or sets since DynamoDB has some fairly specific opinions
about how empty arrays or sets should be represented; for example:

```TypeScript
@table("ThermostatConfiguration")
export default class ThermostatConfiguration extends DeviceWithTenantAndId {
  ...
  // Available actions: GraphQL.ThermostatAction (may be `undefined` if no actions are available)
  @attribute({ memberType: "String" })
  public availableActions?: Set<GraphQL.ThermostatAction>;
  ...
}

class ThermostatConfigurationMapper
  implements
    GraphQLModelMapper<
      GraphQL.ThermostatConfiguration,
      GraphQL.ThermostatConfigurationCreateInput,
      ThermostatConfiguration
    > {
  public graphqlFromModel(rhs: ThermostatConfiguration): GraphQL.ThermostatConfiguration {
    const { availableActions, ...remainder } = rhs;

    return {
      ...remainder,
      availableActions: availableActions ? Array.from(availableActions) : [],
    };
  }

  public modelFromGraphql(
    tenant: string,
    rhs: GraphQL.ThermostatConfigurationCreateInput
  ): ThermostatConfiguration {
    const { availableActions, ...remainder } = rhs;

    return Object.assign(new ThermostatConfiguration(), {
      tenant,
      ...remainder,
      availableActions: availableActions.length > 0 ? new Set(availableActions) : undefined,
    });
  }
}
```

### This dates me

One piece of GraphQL magic that was somewhat aggravating to figure out was the handling of dates.
On the database side at least this is easy because dates already move in and out as JavaScript Date objects,
but a few pieces of magic need to come together to make the whole story work.

The `schema.graphql` needs to specify `DateTime` (arbitrary name) as a custom scalar:

```graphql
scalar DateTime
```

The top-level resolvers in the API need to define the custom logic just so:

```TypeScript
const resolvers: GraphQL.Resolvers = {
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    parseValue(value: any): Date {
      return new Date(value);
    },
    serialize(value: Date): string {
      return value.toISOString();
    },
    parseLiteral(ast): Date | null {
      if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
        return new Date(ast.value); // AST value is always a string
      }
      return null;
    },
  }),
  ...
}
```

GraphQL-based code generation needs to specify this type mapping as well in `graphql-codegen.yml`:

```yaml
schema: ../shared/src/schema/schema.graphql

generates:
  ./generated/graphqlTypes.ts:
    config:
      scalars:
        DateTime: Date
    ...
```

And frontend code needs to rehydrate the Date object
(e.g. in the [LatestThermostatValues](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/shared-client/src/stores/latestThermostatValues/index.ts) store)
because for whatever reason this doesn't get covered automatically between GraphQL codegen and Apollo:

```TypeScript
(latestValue: LatestThermostatValue) => {
  // Rehydrate Date types
  return { ...latestValue, deviceTime: new Date(latestValue.deviceTime) };
}
```

## Who are you again?

Auth is a surprisingly touchy thing to get right on both the cloud and frontend side
(and I'm assuming here that I got it right...).

Auth conveniently abbreviates both authentication (who you are) and authorization (what you're allowed to do).
It's important to keep the divide between those in mind at all times.

I use [Auth0](https://auth0.com) for auth, after a protracted (but fruitless) uphill battle with AWS Cognito
and then a protracted (but mostly successful) uphill battle with Auth0.

To cover the frontend side, I configured an Auth0 SPA Application.
To cover the API side, I configured an Auth0 API, enabled role-based authorization control (RBAC),
created a few permissions (e.g. `read:config`, `write:config` ,`read:settings`, `write:settings`, ...),
and for management convenience grouped a few of those into Roles that I then assign to users.

I use Auth0's user `app_metadata` to specify the `tenant` for each user.
An Auth0 Rule forwards that into the access token while a second rule forwards basic user information into the ID token
since I didn't want to bother having to do another lookup on every login.
(Details of this setup are documented in the API's [README.md](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/api/README.md).)

Any request to the API is made with an access token as a bearer token on the HTTP request.
The AWS API Gateway infrastructure that Serverless auto-creates for my Lambdas hands each request
off to my [custom authorizer](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/api/src/auth/handler.ts)
which

- fetches and decodes the JWT,
- verifies it against Auth0's public signing key (which it downloads on demand),
- extracts the authenticated subject as well as custom claims such as the authorized tenant name and permissions,
- packs those into a custom context for use by the GraphQL resolvers,
- and builds a AWS policy document for access to exactly the right API endpoints.

There's some goofy stuff in there inasmuch as the context can only contain string values so the array of permissions
needs to be packed into a comma-separated string for transit from the authorizer to the actual API lambda. Good times.

Declaring which parts of GraphQL require what permission routes through a pretty slick custom GraphQL directive:

```graphql
directive @requiresPermission(permission: RequiredPermission) on FIELD_DEFINITION

enum RequiredPermission {
  READ_CONFIG
  WRITE_CONFIG
  READ_SETTINGS
  WRITE_SETTINGS
  ...
}

type Query {
  getThermostatSettings: [ThermostatSettings!]! @requiresPermission(permission: READ_SETTINGS)
  getSensorConfigurations: [SensorConfiguration!]! @requiresPermission(permission: READ_CONFIG)
  ...
}

type Mutation {
  updateThermostatSettings(thermostatSettings: ThermostatSettingsUpdateInput!): ThermostatSettings!
    @requiresPermission(permission: WRITE_SETTINGS)

  updateThermostatConfiguration(
    thermostatConfiguration: ThermostatConfigurationUpdateInput!
  ): ThermostatConfiguration! @requiresPermission(permission: WRITE_CONFIG)
  ...
}
```

A [`RequiresPermissionDirective`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/api/src/graphql/requiresPermissionDirective.ts)
is passed to Apollo's GraphQL server during [instantiation](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/api/src/graphql/index.ts):

```TypeScript
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives: { requiresPermission: requiresPermissionDirective },
  logger,
});
```

...and now permissions checking happens automagically with the GraphQL schema serving as the single source of truth (as it should be)
and without the involvement any of the resolver code. That's dope.
