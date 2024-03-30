import { DirectiveConfig } from "marked-directive";
import * as path from "path";

import { ImageManager } from "../assets";

export function createFigureDirective(
  imageManager: ImageManager,
  defaultImageSizes: string[],
  siteRelativeInputPath: string,
): DirectiveConfig {
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
            throw new Error(`"src" attribute "${token.attrs.src}" should be a string`);
          }

          const customSizes = token.attrs.sizes;

          if (customSizes && typeof customSizes !== "string") {
            throw new Error(`"sizes" attribute "${customSizes}" should be a string`);
          }

          // Derive site-relative image paths
          const src = decodeURI(token.attrs.src);

          const siteRelativeImagePath = src.startsWith("/")
            ? src
            : "/" + path.join(path.dirname(siteRelativeInputPath), src);

          // Inspect image metadata
          const inputImage = imageManager.getImage(siteRelativeImagePath);

          // Resize image
          // - we should always include 1.0 so we get a good re-encoding of our source image as a fallback
          const resizeFactors = [0.25, 0.5, 1.0];
          const resizedWidths = resizeFactors.map((resizeFactor) => Math.floor(inputImage.width * resizeFactor));

          resizedWidths.forEach((width) => inputImage.resizeImage(width));

          // Emit figure
          const srcset = (ext?: string) =>
            resizedWidths
              .map((width) => `${encodeURI(inputImage.getResizedSiteRelativeImagePath(width, ext))} ${width}w`)
              .join(", ");

          const figureHtml = `
            <figure ${token.attrs.class ? `class="${token.attrs.class}"` : ""}>
              <a href="${token.attrs.href ?? siteRelativeImagePath}">
                <picture>
                  ${imageManager.additionalFormats
                    .map((format) => `<source type="image/${format}" srcset="${srcset(`.${format}`)}">`)
                    .join("\n")}
                  <img 
                      src="${encodeURI(inputImage.getResizedSiteRelativeImagePath(inputImage.width))}"
                      width=${inputImage.width}
                      height=${inputImage.height}
                      srcset="${srcset()}"
                      sizes="${customSizes ?? defaultImageSizes.join(", ")}"
                      alt="${token.text || token.attrs.alt || ""}"
                      >
                </picture>  
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
