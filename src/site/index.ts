import * as path from "path";

import { RootConfig } from "../config";
import { InputDocument } from "../input";

import { generateLayoutTemplateRenderContext } from "./layoutTemplateRenderContext";
import { generatePostTemplateRenderContext } from "./postTemplateRenderContext";

function outputPath(inputDocument: InputDocument, prefix?: string): string {
  const relativePath = path.parse(inputDocument.documentGroupRelativePath);
  return path.join(prefix ?? "", relativePath.dir, relativePath.name, "index.html");
}

const rootConfig: RootConfig = {
  // Paths are relative to repo root (by virtue of being invoked from the repo root)
  inputRootPath: path.resolve("content"),
  themeRootPath: path.resolve("theme"),
  outputRootPath: path.resolve("output"),
  // Transformations
  documentGroups: [
    {
      documentGroupName: "pages",
      inputRootRelativePath: "pages",
      requirePublishDate: false,
      templateName: "_layout.eta",
      templateRenderContext: generateLayoutTemplateRenderContext,
      outputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument),
    },
    {
      documentGroupName: "portfolio",
      inputRootRelativePath: "portfolio",
      requirePublishDate: false,
      templateName: "_layout.eta",
      templateRenderContext: generateLayoutTemplateRenderContext,
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
};

export default rootConfig;
