import { DirectiveConfig } from "marked-directive";

export const notOnTruckDirective: DirectiveConfig = {
  level: "inline",
  marker: ":",
  renderer(token) {
    if (token.meta.name === "notOnTruck") {
      const rawClassName = token.attrs?.className;
      const className = typeof rawClassName === "string" ? rawClassName : "size-4";

      return `<span class="${className} inline-block svg-not-on-truck" title="Not on truck"></span>`;
    }

    return false;
  },
};
