import { Temporal } from "temporal-polyfill";

export type PlainDate = Temporal.PlainDate;

export function plainDateFrom(value: Parameters<typeof Temporal.PlainDate.from>[0]): PlainDate {
  return Temporal.PlainDate.from(value);
}

export function comparePlainDates(one: PlainDate, two: PlainDate): number {
  return Temporal.PlainDate.compare(one, two);
}
