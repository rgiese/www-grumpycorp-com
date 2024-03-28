import { DirectiveConfig } from "marked-directive";
import * as path from "path";

import { sourceSetSizes, getResizedImageName } from "../../assets/imageResizing";

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

      if (typeof token.attrs.src !== "string") {
        throw new Error(`"src" attribute "${token.attrs.src} on ${token.raw} is not a string`);
      }

      const src = token.attrs.src;

      // - This is a rather shlocky and generic calculation given that we're doing this site-wide
      //   instead of performing it on an image-by-image basis with awareness of how it's being laid out.
      //   We're assuming that our image content in the main content area is generally no wider than 50% of the screen
      //   so we're spec'ing an image resolution half as wide as the viewport.
      //   Close enough.
      const parsedImagePath = path.parse(src);
      const sourceSets = sourceSetSizes.map((size) => `${getResizedImageName(parsedImagePath, size)} ${size}w`);
      const sizes = sourceSetSizes.map((size) => `(max-width: ${2 * size}px) ${size}px`);

      return `
        <figure ${token.attrs.class ? `class="${token.attrs.class}"` : ""}>
          <a href="${src}">
            <img src="${src}" alt="${token.text || token.attrs.alt || ""}" srcset="${sourceSets.join(", ")}" sizes="${sizes.join(", ")}"/>
          </a>
          ${token.text ? `<figcaption>${token.text}</figcaption>` : ""}
        </figure>
      `;
    }

    return false;
  },
};
