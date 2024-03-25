import * as fs from "fs";
import * as path from "path";

import { RootConfig } from "../config";
import { enumerateFilesRecursive } from "../tools";

export function processAssets(rootConfig: RootConfig) {
  const themeFiles = Array.from(enumerateFilesRecursive(rootConfig.themeRootPath));

  // Copy simple assets
  const simpleAssetExtensions = [".jpg", ".png", ".svg", ".eot", ".ttf", ".woff", ".woff2"];

  themeFiles
    .filter((x) => simpleAssetExtensions.includes(path.extname(x)))
    .forEach((sourcePath) => {
      const outputPath = path.join(rootConfig.outputRootPath, path.relative(rootConfig.themeRootPath, sourcePath));

      const outputDirectory = path.dirname(outputPath);

      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      fs.copyFileSync(sourcePath, outputPath);
    });
}
