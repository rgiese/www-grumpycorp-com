import { DirectiveConfig } from "marked-directive";
import * as path from "path";

import { ImageManager } from "../assets";

const stringAttr = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

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
            throw new Error(`"src" attribute must be a string`);
          }

          const customSizes = stringAttr(token.attrs.sizes);

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

          resizedWidths.forEach((width) => { inputImage.resizeImage(width); });

          // Emit figure
          const srcset = (ext?: string) =>
            resizedWidths
              .map((width) => `${encodeURI(inputImage.getResizedSiteRelativeImagePath(width, ext))} ${width}w`)
              .join(", ");

          const classAttr = stringAttr(token.attrs.class);
          const hrefAttr = stringAttr(token.attrs.href);
          const altAttr = stringAttr(token.attrs.alt);
          const outerDivWithClassAttr = stringAttr(token.attrs.outerDivWithClass);

          const figureHtml = `
            <figure ${classAttr ? `class="${classAttr}"` : ""}>
              <a href="${hrefAttr ?? siteRelativeImagePath}">
                <picture>
                  ${imageManager.additionalFormats
                    .map((format) => `<source type="image/${format}" srcset="${srcset(`.${format}`)}">`)
                    .join("\n")}
                  <img
                      src="${encodeURI(inputImage.getResizedSiteRelativeImagePath(inputImage.width))}"
                      width="${inputImage.width}"
                      height="${inputImage.height}"
                      srcset="${srcset()}"
                      sizes="${customSizes ?? defaultImageSizes.join(", ")}"
                      alt="${token.text.length > 0 ? token.text : (altAttr ?? "")}"
                      >
                </picture>
              </a>
              ${token.text ? `<figcaption>${token.text}</figcaption>` : ""}
            </figure>
          `;

          // Emit complete HTML
          return outerDivWithClassAttr ? `<div class="${outerDivWithClassAttr}">${figureHtml}</div>` : figureHtml;
        } catch (error) {
          console.error(`While processing ${token.raw}:`);
          throw error;
        }
      }

      return false;
    },
  };
}
