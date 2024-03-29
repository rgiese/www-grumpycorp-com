import { DirectiveConfig } from "marked-directive";
import * as path from "path";

import { ImageManager } from "../assets";

export function createFigureDirective(imageManager: ImageManager, siteRelativeInputPath: string): DirectiveConfig {
  return {
    level: "block",
    marker: "::",
    renderer(token) {
      if (token.meta.name === "figure") {
        try {
          // Validate parameters
          if (!token.attrs) {
            throw new Error(`No attributes specified`);
          }

          if (!token.attrs.src) {
            throw new Error(`Missing "src" attribute`);
          }

          if (typeof token.attrs.src !== "string") {
            throw new Error(`"src" attribute "${token.attrs.src} is not a string`);
          }

          // Derive site-relative image paths
          const src = token.attrs.src;

          const parsedSiteRelativeInputPath = path.parse(siteRelativeInputPath);

          const siteRelativeImagePath = src.startsWith("/")
            ? src
            : "/" +
              path.join(
                parsedSiteRelativeInputPath.dir,
                parsedSiteRelativeInputPath.name, // TEMPORARY: given that .../foo.md will render into .../foo/index.html
                src,
              );

          // Inspect image metadata
          const inputImage = imageManager.getImage(decodeURIComponent(siteRelativeImagePath));

          // Emit figure
          const figureHtml = `
            <figure ${token.attrs.class ? `class="${token.attrs.class}"` : ""}>
              <a href="${token.attrs.href ?? src}">
                <img 
                    src="${siteRelativeImagePath}"
                    width=${inputImage.width}
                    height=${inputImage.height}
                    alt="${token.text || token.attrs.alt || ""}"
                    >
              </a>
              ${token.text ? `<figcaption>${token.text}</figcaption>` : ""}
            </figure>
      `;

          // Emit complete HTML
          return token.attrs.outerDivWithClass
            ? `<div class="${token.attrs.outerDivWithClass}">${figureHtml}</div>`
            : figureHtml;
        } catch (error) {
          console.error(`While processing ${token.raw}:`);
          throw error;
        }
      }

      return false;
    },
  };
}
