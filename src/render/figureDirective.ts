import { DirectiveConfig } from "marked-directive";
import * as path from "path";

import { ImageManager, ImageResizeRequest } from "../assets";

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
          const src = decodeURI(token.attrs.src);

          const siteRelativeImagePath = src.startsWith("/")
            ? src
            : "/" + path.join(path.dirname(siteRelativeInputPath), src);

          const parsedSiteRelativeImagePath = path.parse(siteRelativeImagePath);

          // Inspect image metadata
          const inputImage = imageManager.getImage(siteRelativeImagePath);

          // Resize image
          const resizeFactors = [0.25, 0.5, 1.0];

          const resizedImages: { siteRelativeOutputPath: string; imageResizeRequest: ImageResizeRequest }[] =
            resizeFactors.map((resizeFactor) => {
              const width = Math.floor(inputImage.width * resizeFactor);

              const siteRelativeOutputPath = path.format({
                ...parsedSiteRelativeImagePath,
                base: undefined /* so `name` is used */,
                name: `${parsedSiteRelativeImagePath.name}-${width}w`,
              });

              return {
                siteRelativeOutputPath,
                imageResizeRequest: { width },
              };
            });

          resizedImages.forEach((r) => inputImage.resizeImage(r.siteRelativeOutputPath, r.imageResizeRequest));

          // Emit figure
          const figureHtml = `
            <figure ${token.attrs.class ? `class="${token.attrs.class}"` : ""}>
              <a href="${token.attrs.href ?? siteRelativeImagePath}">
                <img 
                    src="${encodeURI(siteRelativeImagePath)}"
                    width=${inputImage.width}
                    height=${inputImage.height}
                    srcset="${resizedImages.map((r) => `${encodeURI(r.siteRelativeOutputPath)} ${r.imageResizeRequest.width}w`).join(", ")}"
                    sizes="(max-width: 30em) 100vw, 50vw"
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
