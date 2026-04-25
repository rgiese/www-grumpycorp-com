import { DirectiveConfig } from "marked-directive";

export const notOnTruckDirective: DirectiveConfig = {
  level: "inline",
  marker: ":",
  renderer(token) {
    if (token.meta.name === "notOnTruck") {
      const rawClassName = token.attrs?.className;
      const className = typeof rawClassName === "string" ? rawClassName : "h1";

      return `<span class="${className} dib svg-not-on-truck" title="Not on truck"></span>`;
    }

    return false;
  },
};
