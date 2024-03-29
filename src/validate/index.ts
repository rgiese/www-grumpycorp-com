import * as fs from "fs";
import * as path from "path";
import { JSDOM } from "jsdom";

import { FileSpec } from "../types";
import { enumerateFilesRecursive } from "../fileSystem/enumerateFiles";

export class SiteValidator {
  constructor(private readonly outputRootPath: string) {}

  public validate() {
    const outputFiles = Array.from(enumerateFilesRecursive(this.outputRootPath, this.outputRootPath));

    outputFiles.filter((f) => f.parsedRootRelativePath.ext === ".html").forEach((f) => this.validateHtmlFile(f));
  }

  private validateHtmlFile(fileSpec: FileSpec) {
    try {
      const dom = new JSDOM(fs.readFileSync(fileSpec.absolutePath, "utf8"));

      type ElementAndAttribute = {
        elementName: string;
        attributeName: string;
      };

      const elementsAndAttributesToValidate: ElementAndAttribute[] = [
        { elementName: "a", attributeName: "href" },
        { elementName: "img", attributeName: "src" },
      ];

      elementsAndAttributesToValidate.forEach(({ elementName, attributeName }) => {
        const elements = dom.window.document.getElementsByTagName(elementName.toUpperCase());

        for (const element of elements) {
          const target = element.getAttribute(attributeName);

          if (!target) {
            throw new Error(`Attribute ${attributeName} not found on ${element.outerHTML}`);
          }

          if (target.startsWith("https://") || target.startsWith("mailto:")) {
            // Ignore off-site links
            continue;
          }

          if (target.startsWith("http://")) {
            throw new Error(`Should not link to http:// sites (${target} in ${element.outerHTML})`);
          }

          const siteRootRelativeTarget = target.startsWith("/")
            ? target
            : path.join(fileSpec.parsedRootRelativePath.dir, target);

          const absoluteTarget = path.join(this.outputRootPath, decodeURI(siteRootRelativeTarget));

          if (!fs.existsSync(absoluteTarget)) {
            if (!path.extname(absoluteTarget)) {
              // Try again with .../index.html
              const absoluteTarget_AsIndexPage = absoluteTarget + "/index.html";

              if (fs.existsSync(absoluteTarget_AsIndexPage)) {
                // Good enough
                continue;
              }
            }

            throw new Error(`Can't find /${siteRootRelativeTarget} targeted by ${element.outerHTML}`);
          }
        }
      });
    } catch (error) {
      console.error(`While validating ${fileSpec.rootRelativePath}:`);
      throw error;
    }
  }
}
