import * as path from "path";

import { RootConfig } from "./config";
import { InputDocument } from "./input";

function outputPath(inputDocument: InputDocument, prefix?: string): string {
  const relativePath = path.parse(inputDocument.relativePath);
  return path.join(prefix ?? "", relativePath.dir, relativePath.name, "index.html");
}

const rootConfig: RootConfig = {
  // Paths are relative to repo root (by virtue of being invoked from the repo root)
  inputRootPath: path.resolve("content"),
  outputRootPath: path.resolve("output"),
  documentGroups: [
    {
      documentGroupName: "pages",
      inputRelativePath: "pages",
      ouputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument),
    },
    {
      documentGroupName: "portfolio",
      inputRelativePath: "portfolio",
      ouputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument, "portfolio"),
    },
    {
      documentGroupName: "posts",
      inputRelativePath: "posts",
      ouputPathFromDocumentPath: (inputDocument) => outputPath(inputDocument, "posts"),
    },
  ],
};

export default rootConfig;
