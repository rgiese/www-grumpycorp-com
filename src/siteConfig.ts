import * as path from "path";

import { RootConfig } from "./config";
import { InputDocument } from "./input";

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
      outputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument),
      templateName: "layout.eta",
    },
    {
      documentGroupName: "portfolio",
      inputRootRelativePath: "portfolio",
      outputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument, "portfolio"),
      templateName: "layout.eta",
    },
    {
      documentGroupName: "posts",
      inputRootRelativePath: "posts",
      outputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument, "posts"),
      templateName: "layout.eta",
    },
  ],
};

export default rootConfig;
