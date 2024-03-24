import * as path from "path";

import { RootConfig } from "./config";

const rootConfig: RootConfig = {
  // Paths are relative to repo root (by virtue of being invoked from the repo root)
  inputRootPath: path.resolve("content"),
  outputRootPath: path.resolve("output"),
  documentGroups: [
    {
      documentGroupName: "pages",
      inputRelativePath: "pages",
    },
    {
      documentGroupName: "portfolio",
      inputRelativePath: "portfolio",
    },
    {
      documentGroupName: "posts",
      inputRelativePath: "posts",
    },
  ],
};

export default rootConfig;
