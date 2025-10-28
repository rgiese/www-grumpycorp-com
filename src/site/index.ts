import * as path from "path";

import { RootConfig } from "../config";
import { GeneratedDocumentsGenerator, RenderContextGenerator, InputDocument, TemplateType } from "../types";

import { generateLayoutTemplateRenderContext } from "./layoutTemplateRenderContext";
import { generatePostTemplateRenderContext } from "./postTemplateRenderContext";
import { postIndexPagesGenerator } from "./postIndexPagesGenerator";

import { customDirectives } from "./customDirectives";
import { getDocumentTag } from "./documentTag";

function outputPath(inputDocument: InputDocument, prefix?: string): string {
  const relativePath = path.parse(inputDocument.documentGroupRelativePath);
  return path.join(prefix ?? "", relativePath.dir, relativePath.name, "index.html");
}

const layoutTemplateRenderContext: RenderContextGenerator = (_inputDocument, inputDocumentInventory) =>
  generateLayoutTemplateRenderContext(inputDocumentInventory);

const generatedDocuments: GeneratedDocumentsGenerator = (inputDocumentInventory) => {
  const postDocuments = inputDocumentInventory.get("posts") || [];
  const latestPostDocument = postDocuments.length ? postDocuments[postDocuments.length - 1] : undefined;

  return [
    ...postIndexPagesGenerator(inputDocumentInventory),
    // Home
    {
      siteRelativeOutputPath: "index.html",
      frontMatter: {
        title: "Home",
      },
      contentTemplateType: TemplateType.Marked,
      contentTemplateName: "index.md",
      contentTemplateContext: {},
      templateName: "_layout.eta",
      // We're relying on `generateLayoutTemplateRenderContext` not specializing on any given input document
      templateRenderContext: {
        ...generateLayoutTemplateRenderContext(inputDocumentInventory),
        isHomePage: true,
        latestPostDocument,
        latestPostTag: latestPostDocument ? getDocumentTag(latestPostDocument) : "",
      },
    },
    // 404
    {
      siteRelativeOutputPath: "404.html",
      frontMatter: {
        title: "Sadness",
      },
      contentTemplateType: TemplateType.Marked,
      contentTemplateName: "404.md",
      contentTemplateContext: {},
      templateName: "_layout.eta",
      // We're relying on `generateLayoutTemplateRenderContext` not specializing on any given input document
      templateRenderContext: generateLayoutTemplateRenderContext(inputDocumentInventory),
    },
  ];
};

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
      templateName: "_layout.eta",
      templateRenderContext: layoutTemplateRenderContext,
      outputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument),
    },
    {
      documentGroupName: "portfolio",
      inputRootRelativePath: "portfolio",
      requirePublishDate: false,
      templateName: "_layout.eta",
      templateRenderContext: layoutTemplateRenderContext,
      outputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument, "portfolio"),
    },
    {
      documentGroupName: "posts",
      inputRootRelativePath: "posts",
      requirePublishDate: true,
      templateName: "_layout.eta",
      templateRenderContext: generatePostTemplateRenderContext,
      outputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument, "posts"),
    },
  ],
  generatedDocuments,
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
  svgToCssTranscodes: [{ inputRootRelativePath: "assets/packed", siteRelativeOutputPath: "assets/svg.scss" }],
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
