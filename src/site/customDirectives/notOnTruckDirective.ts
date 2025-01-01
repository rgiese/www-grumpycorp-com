import { DirectiveConfig } from "marked-directive";

export const notOnTruckDirective: DirectiveConfig = {
  level: "inline",
  marker: ":",
  renderer(token) {
    if (token.meta.name === "notOnTruck") {
      const className = token?.attrs?.className || "h1";

      return `<span class="${className} dib svg-not-on-truck" title="Not on truck"></span>`;
    }

    return false;
  },
};
