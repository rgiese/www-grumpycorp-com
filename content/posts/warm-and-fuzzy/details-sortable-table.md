---
title: "Details: A React-based sortable table"
published: 2020-02-08 19:00
keywords: ["IoT", "React", "TypeScript", "GraphQL", "Table"]
---

To come back to the React-based web app again, note that every table's column headers are also a sort order affordance and indicator:

::figure[Tables with headers and sorting indicators]{src="../webapp/webapp-home.png"}

Since we're getting all fancy up in here and have a few tables to show,
I built a [`SortableTable`](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/webapp/src/components/SortableTable.tsx)
component to centralize sorting the data.

#### Trivial table setup

The table layout is super-easy to configure.
Just specialize `TableFieldDefinition` with the type of data you'll be passing to the table.

```TypeScript
import SortableTable, { TableFieldDefinition } from "./SortableTable";

const tableDefinition: TableFieldDefinition<ThermostatValue>[] = [
  { field: "name", label: "Thermostat" },
  { field: "lastUpdated", label: "Last updated" },
  { field: "temperature", label: "Temperature" },
  { field: "humidity", label: "Humidity", units: "%" },
  { field: "setPointHeat", label: "Heat to" },
  { field: "setPointCool", label: "Cool to" },
  { field: "currentActions", label: "Actions" },
];

...
  <SortableTable
    data={values}
    defaultSortField="name"
    fieldDefinitions={tableDefinition}
    keyField="id"
    tableProps={{ basic: "very", collapsing: true, compact: true, size: "small" }}
  />
```

Wowsers.

#### Somewhat less trivial table setup

For some of my tables I need to look up some references for each row of data so I just extend the type and do a quick `map` to assemble the data
(the previous example was abbreviated for simplicity).
The `tableDefinition` shown previously continuous to stand.

```TypeScript
type ThermostatValue = LatestThermostatValue & {
  // Injected fields
  name: string;
  lastUpdated: string;
};

...

// Project data
const values = latestThermostatValuesStore.data.map(
  (value): ThermostatValue => {
    return {
      ...value,
      // Injected fields
      name: thermostatConfigurationStore.findById(value.id)?.name ?? value.id,
      lastUpdated: moment(value.deviceTime).from(latestRenderTime),
    };
  }
);
```

#### Somewhat furtherly less trivial table setup

Well, I lied again, the previous example was also abbreviated for simplicity because I also need to convert the types of some of the values
from scalars (e.g. `temperature` as a `number`) to strongly-typed wrappers for units-of-measurement magic (e.g. `temperature` as a `Temperature`).
The `tableDefinition` shown previously continuous to stand.

Here's the fully fleshed-out code for both type and data manipulation:

```TypeScript
type ThermostatValue = Omit<
  LatestThermostatValue,
  "temperature" | "setPointHeat" | "setPointCool"
> & {
  // Injected fields
  name: string;
  lastUpdated: string;
  // Type-converted fields
  temperature: Temperature;
  setPointHeat?: Temperature;
  setPointCool?: Temperature;
};

...

// Project data
const values = latestThermostatValuesStore.data.map(
  (value): ThermostatValue => {
    return {
      ...value,
      // Injected fields
      name: thermostatConfigurationStore.findById(value.id)?.name ?? value.id,
      lastUpdated: moment(value.deviceTime).from(latestRenderTime),
      // Type-converted fields
      temperature: new Temperature(value.temperature),
      setPointHeat: value.allowedActions.includes(GraphQL.ThermostatAction.Heat)
        ? new Temperature(value.setPointHeat)
        : undefined,
      setPointCool: value.allowedActions.includes(GraphQL.ThermostatAction.Cool)
        ? new Temperature(value.setPointCool)
        : undefined,
    };
  }
);
```

#### Where the not-very-magic happens

The code for this component is so compact that I might as well paste it here, which also provides a preview for how I handle custom units-of-measurement
(e.g. `Temperature`, `RelativeTemperature` below).
The latest version is of course [on GitHub](https://github.com/rgiese/warm-and-fuzzy/blob/master/packages/webapp/src/components/SortableTable.tsx).

```TypeScript
import React, { useState } from "react";
import {
  RelativeTemperature,
  Temperature,
  useRootStore,
} from "@grumpycorp/warm-and-fuzzy-shared-client";
import { StrictTableProps, Table } from "semantic-ui-react";

import { useObserver } from "mobx-react";

//
// To add support for new custom types:
// - Add type to TableData type enumeration
// - Add comparison logic for type to compareAscending below
// - Add presentatic logic for type to valuePresenter below
//

interface TableData {
  [key: string]:
    | string
    | number
    | Date
    | Temperature
    | RelativeTemperature
    | string[]
    | number[]
    | undefined;
}

type TableProps = Omit<StrictTableProps, "renderBodyRow" | "tableData" | "sortable">;

export interface TableFieldDefinition<T> {
  field: keyof T;
  label: string;
  units?: string | React.ReactElement;
}

//
// Implements what we need from the React.FunctionComponent contract without referring to it directly
// since we can't forward our generics otherwise.
//

const SortableTable = <T extends TableData>({
  data,
  keyField,
  fieldDefinitions,
  defaultSortField,
  right,
  tableProps,
}: {
  data: T[];
  keyField: keyof T;

  fieldDefinitions: TableFieldDefinition<T>[];
  defaultSortField: keyof T;

  right?: (value: T) => React.ReactElement;

  tableProps?: TableProps;
}): React.ReactElement => {
  const [sortOrder, setSortOrder] = useState<keyof T>(defaultSortField);
  const [sortAscending, setSortAscending] = useState(true);

  const rootStore = useRootStore();

  //
  // Helpers for managing sort order
  //

  const handleSortByField = (field: keyof T) => (): void => {
    if (field !== sortOrder) {
      setSortOrder(field);
      setSortAscending(true);
    } else {
      setSortAscending(!sortAscending);
    }
  };

  const isSortedByField = (field: keyof T): "ascending" | "descending" | undefined => {
    if (field !== sortOrder) {
      return undefined;
    }

    return sortAscending ? "ascending" : "descending";
  };

  //
  // Sort data
  //

  const compareAscending = (lhs: T, rhs: T): number => {
    const lhsKey = lhs[sortOrder];
    const rhsKey = rhs[sortOrder];

    if (lhsKey === undefined) {
      // Sort undefined keys to the end (highest values) of the list
      return rhsKey === undefined ? 0 : 1;
    } else if (rhsKey === undefined) {
      return -1;
    }

    if (typeof lhsKey !== typeof rhsKey) {
      // Caller-side TypeScript should have caught this
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Sort key types don't match for field ${sortOrder.toString()}: ${lhsKey} / ${rhsKey}`
      );
    }

    if (typeof lhsKey === "string" && typeof rhsKey === "string") {
      return lhsKey.localeCompare(rhsKey);
    }

    if (typeof lhsKey === "number" && typeof rhsKey === "number") {
      return lhsKey - rhsKey;
    }

    if (lhsKey instanceof Date && rhsKey instanceof Date) {
      return lhsKey.getTime() - rhsKey.getTime();
    }

    if (lhsKey instanceof Temperature && rhsKey instanceof Temperature) {
      return lhsKey.valueInCelsius - rhsKey.valueInCelsius;
    }

    if (lhsKey instanceof RelativeTemperature && rhsKey instanceof RelativeTemperature) {
      return lhsKey.valueInCelsius - rhsKey.valueInCelsius;
    }

    if (Array.isArray(lhsKey) && Array.isArray(rhsKey)) {
      return lhsKey.toString().localeCompare(rhsKey.toString());
    }

    // Caller-side TypeScript should have caught this
    throw new Error(`Unsupported type for field ${sortOrder.toString()}`);
  };

  const sortedData =
    // .slice(): Duplicate data so we don't mutate the passed-in object
    data.slice().sort((lhs, rhs): number => {
      const ascendingResult = compareAscending(lhs, rhs);
      return sortAscending ? ascendingResult : -1 * ascendingResult;
    });

  return useObserver(() => (
    <Table sortable {...tableProps}>
      <Table.Header>
        <Table.Row>
          {fieldDefinitions.map(
            (fieldDefinition): React.ReactElement => (
              <Table.HeaderCell
                key={fieldDefinition.label}
                onClick={handleSortByField(fieldDefinition.field)}
                sorted={isSortedByField(fieldDefinition.field)}
              >
                {fieldDefinition.label}
              </Table.HeaderCell>
            )
          )}
          {right && <Table.HeaderCell />}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedData.map(
          (value): React.ReactElement => {
            return (
              <Table.Row
                key={
                  Array.isArray(value[keyField]) ? undefined : (value[keyField] as string | number)
                }
              >
                {fieldDefinitions.map(
                  (fieldDefinition): React.ReactElement => {
                    // `v` is intentionally typed as `any` -> tell eslint to go away
                    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
                    const valuePresenter = (v: any): any => {
                      if (Array.isArray(v)) {
                        return v.join(", ");
                      }

                      if (v instanceof Date) {
                        return v.toLocaleString();
                      }

                      if (v instanceof Temperature) {
                        return v.toString(rootStore.userPreferencesStore.userPreferences);
                      }

                      if (v instanceof RelativeTemperature) {
                        return v.toString(rootStore.userPreferencesStore.userPreferences);
                      }

                      return v;
                    };

                    return (
                      <Table.Cell key={fieldDefinition.field as string}>
                        {valuePresenter(value[fieldDefinition.field])}
                        {fieldDefinition.units}
                      </Table.Cell>
                    );
                  }
                )}
                {right && <Table.Cell>{right(value)}</Table.Cell>}
              </Table.Row>
            );
          }
        )}
      </Table.Body>
    </Table>
  ));
};

export default SortableTable;
```

Again, wowsers.
