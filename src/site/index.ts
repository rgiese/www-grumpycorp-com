import path from "node:path";

import { RootConfig } from "../config";
import { InputDocument, TemplateType, PlainDate, comparePlainDates } from "../types";

import { generatePostTemplateRenderContext } from "./postTemplateRenderContext";

import { customDirectives } from "./customDirectives";
import { getDocumentTag, getDocumentTagSet, tagPresenter } from "./documentTag";

function outputPath(inputDocument: InputDocument, prefix?: string): string {
  const relativePath = path.parse(inputDocument.documentGroupRelativePath);
  return path.join(
    prefix ?? "",
    relativePath.dir,
    relativePath.name === "index" ? "" : relativePath.name,
    "index.html",
  );
}

const rootConfig: RootConfig = {
  // Paths are relative to repo root (by virtue of being invoked from the repo root)
  inputRootPath: path.resolve("content"),
  themeRootPath: path.resolve("theme"),
  outputRootPath: path.resolve("output"),
  // Input
  documentGroups: [
    {
      documentGroupName: "pages",
      inputRootRelativePath: "pages",
      requirePublishDate: false,
      templateName: "_layout_v2.eta",
      // Output pages at the root level, e.g. content/pages/foo.md -> output/foo/index.html
      outputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument),
    },
    {
      documentGroupName: "portfolio",
      inputRootRelativePath: "portfolio",
      requirePublishDate: false,
      templateName: "_layout.eta",
      // Output pages under the "portfolio" path, e.g. content/portfolio/foo.md -> output/portfolio/foo/index.html
      outputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument, "portfolio"),
    },
    {
      documentGroupName: "posts",
      inputRootRelativePath: "posts",
      requirePublishDate: true,
      templateName: "_layout.eta",
      templateRenderContext: generatePostTemplateRenderContext,
      // Output pages under the "posts" path, e.g. content/posts/collection/foo.md -> output/posts/collection/foo/index.html
      outputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument, "posts"),
    },
  ],
  generatedDocuments: (inputDocumentInventory) => [
    // 404
    {
      siteRelativeOutputPath: "404.html",
      frontMatter: {
        title: "Sadness",
        useDefaultLayout: true,
      },
      contentTemplateType: TemplateType.Marked,
      contentTemplateName: "404.md",
      contentTemplateContext: {},
      templateName: "_layout_v2.eta",
    },
    // Posts index
    {
      siteRelativeOutputPath: "posts/index.html",
      frontMatter: {
        title: "All blog posts",
        useDefaultLayout: false,
      },
      contentTemplateType: TemplateType.Eta,
      contentTemplateName: "_post_index.eta",
      contentTemplateContext: {
        tagPresenter,
        postTags: getDocumentTagSet(inputDocumentInventory.get("posts") ?? []),
        postDocuments: (inputDocumentInventory.get("posts") ?? [])
          .sort((lhs, rhs) =>
            comparePlainDates(rhs.frontMatter.published as PlainDate, lhs.frontMatter.published as PlainDate),
          )
          .map((d) => {
            return { ...d, documentTag: getDocumentTag(d) };
          }),
      },
      templateName: "_layout_v2.eta",
    },
  ],
  // Transform
  customDirectives,
  // defaultImageSizes:
  // - We present with _layout.eta which formats core content as `fl-ns fn w-50-ns`, i.e. single column for small screens, 50% width for non-small screens.
  //
  //   This means we can assume:
  //     - full-width (100vw) images for small screens
  //     - half-width (50vw) images for non-small screens
  //
  // - Tachyons sets the breakpoint for non-small at 30em.
  //
  // - The first image size that meets the constraints is chosen, so start with max-width: @non-small.
  defaultImageSizes: ["(max-width: 30em) 100vw", "50vw"],
  // Asset transcodes
  svgToCssTranscodes: [{ inputRootRelativePath: "assets/packed", siteRelativeOutputPath: "assets/svg.css" }],
  // Redirects
  redirects: [
    { source: "/posts/film%20making/*", destination: "/posts/film-making/:splat", code: 301 },
    { source: "/tags/posts/film%20making/*", destination: "/tags/posts/film-making/:splat", code: 301 },
    {
      // The "how to help PhinneyWood" doc
      source: "/halp",
      destination: "https://docs.google.com/document/d/1LdxnTdPSHpu5Qo9iqCBnGHIR1Bw7zhtbTvPyQM3A-Dw/edit?usp=sharing",
      code: 301,
    },
  ],
};

export default rootConfig;
