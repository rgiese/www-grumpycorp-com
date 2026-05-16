import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import postcss from "postcss";

import { FileSpec } from "../types";
import { enumerateFilesRecursive } from "../fileSystem/enumerateFiles";

function extractCssClassNames(css: string): Set<string> {
  const classNames = new Set<string>();
  const root = postcss.parse(css);

  const classPattern = /\.(-?(?:[a-zA-Z_]|\\.)(?:[a-zA-Z0-9_-]|\\.)*)/g;

  root.walkRules((rule) => {
    let match: RegExpExecArray | null;

    classPattern.lastIndex = 0;

    while ((match = classPattern.exec(rule.selector)) !== null) {
      classNames.add(match[1].replace(/\\(.)/g, "$1"));
    }
  });

  return classNames;
}

export class SiteValidator {
  constructor(private readonly outputRootPath: string) {}

  private readonly cssFileCache = new Map<string, Set<string>>();

  private loadCssClassesForPage(document: Document): Set<string> {
    const classes = new Set<string>();

    for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
      const href = link.getAttribute("href");

      if (!href || href.startsWith("https://")) {
        continue;
      }

      const cached = this.cssFileCache.get(href);

      if (cached) {
        for (const cls of cached) {
          classes.add(cls);
        }

        continue;
      }

      const cssPath = path.join(this.outputRootPath, href);
      const extracted = extractCssClassNames(fs.readFileSync(cssPath, "utf8"));

      this.cssFileCache.set(href, extracted);

      for (const cls of extracted) {
        classes.add(cls);
      }
    }

    return classes;
  }

  public validate() {
    const outputFiles = Array.from(enumerateFilesRecursive(this.outputRootPath, this.outputRootPath));

    outputFiles
      .filter((f) => f.parsedRootRelativePath.ext === ".html")
      .forEach((f) => {
        this.validateHtmlFile(f);
      });
  }

  private validateHtmlFile(fileSpec: FileSpec) {
    try {
      const dom = new JSDOM(fs.readFileSync(fileSpec.absolutePath, "utf8"));

      interface ElementAndAttribute {
        elementName: string;
        attributeName: string;
      }

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

            throw new Error(
              `Can't find /${siteRootRelativeTarget} (${absoluteTarget}) targeted by ${element.outerHTML}`,
            );
          }
        }
      });

      //
      // Validate CSS classes
      //

      const validCssClasses = this.loadCssClassesForPage(dom.window.document);

      for (const element of dom.window.document.querySelectorAll("[class]")) {
        if (element.closest("pre")) {
          continue; // highlight.js adds language-* and other non-CSS classes to code blocks
        }

        const classAttr = element.getAttribute("class");

        if (!classAttr) {
          continue;
        }

        for (const cls of classAttr.trim().split(/\s+/)) {
          if (cls && !validCssClasses.has(cls)) {
            throw new Error(`CSS class "${cls}" not defined in any linked stylesheet (on ${element.outerHTML})`);
          }
        }
      }
    } catch (error) {
      console.error(`While validating ${fileSpec.rootRelativePath}:`);
      throw error;
    }
  }
}
