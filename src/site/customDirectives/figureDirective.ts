import { DirectiveConfig } from "marked-directive";

export const figureDirective: DirectiveConfig = {
  level: "block",
  marker: "::",
  renderer(token) {
    if (token.meta.name === "figure") {
      if (!token.attrs) {
        throw new Error(`No attributes specific on ${token.raw}`);
      }

      if (!token.attrs.src) {
        throw new Error(`Missing "src" attribute on ${token.raw}`);
      }

      return `
        <figure ${token.attrs.class ? `class="${token.attrs.class}"` : ""}>
          <a href="${token.attrs.src}">
            <img src="${token.attrs.src}" alt="${token.text || token.attrs.alt || ""}"/>
          </a>
          ${token.text ? `<figcaption>${token.text}</figcaption>` : ""}
        </figure>
      `;
    }

    return false;
  },
};
