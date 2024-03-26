import * as path from "path";

import { RootConfig } from "../config";
import { InputDocument } from "../input";

function outputPath(inputDocument: InputDocument, prefix?: string): string {
  const relativePath = path.parse(inputDocument.documentGroupRelativePath);
  return path.join(prefix ?? "", relativePath.dir, relativePath.name, "index.html");
}

function postTemplateRenderContext(inputDocument: InputDocument, inputDocumentsInGroup: InputDocument[]) {
  const thisDocumentIndex = inputDocumentsInGroup.findIndex(
    (d) => d.sourceFile.rootRelativePath === inputDocument.sourceFile.rootRelativePath,
  );

  const previousDocument = thisDocumentIndex > 0 ? inputDocumentsInGroup[thisDocumentIndex - 1] : undefined;

  const nextDocument =
    thisDocumentIndex >= 0 && thisDocumentIndex < inputDocumentsInGroup.length - 1
      ? inputDocumentsInGroup[thisDocumentIndex + 1]
      : undefined;

  return {
    previousDocument,
    nextDocument,
  };
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
      templateRenderContext: undefined,
      outputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument),
    },
    {
      documentGroupName: "portfolio",
      inputRootRelativePath: "portfolio",
      requirePublishDate: false,
      templateName: "_layout.eta",
      templateRenderContext: undefined,
      outputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument, "portfolio"),
    },
    {
      documentGroupName: "posts",
      inputRootRelativePath: "posts",
      requirePublishDate: true,
      templateName: "_layout.eta",
      templateRenderContext: postTemplateRenderContext,
      outputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument, "posts"),
    },
  ],
};

export default rootConfig;
