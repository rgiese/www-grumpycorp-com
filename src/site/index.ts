import * as path from "path";

import { GeneratedDocumentsGenerator, RootConfig, RenderContextGenerator, TemplateType } from "../config";
import { InputDocument } from "../input";

import { generateLayoutTemplateRenderContext } from "./layoutTemplateRenderContext";
import { generatePostTemplateRenderContext } from "./postTemplateRenderContext";
import { postIndexPagesGenerator } from "./postIndexPagesGenerator";

import { customDirectives } from "./customDirectives";

function outputPath(inputDocument: InputDocument, prefix?: string): string {
  const relativePath = path.parse(inputDocument.documentGroupRelativePath);
  return path.join(prefix ?? "", relativePath.dir, relativePath.name, "index.html");
}

const layoutTemplateRenderContext: RenderContextGenerator = (_inputDocument, inputDocumentInventory) =>
  generateLayoutTemplateRenderContext(inputDocumentInventory);

const generatedDocuments: GeneratedDocumentsGenerator = (inputDocumentInventory) => {
  return [
    ...postIndexPagesGenerator(inputDocumentInventory),
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
};

export default rootConfig;
