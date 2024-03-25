import * as fs from "fs";
import * as path from "path";
import * as sass from "sass";

import { RootConfig } from "../config";
import { enumerateFilesRecursive } from "../tools";

function replaceFileExtension(outputPath: string, revisedExtension: string): string {
  return path.format({ ...path.parse(outputPath), base: "", ext: revisedExtension });
}

export function processAssets(rootConfig: RootConfig, inputRootPath: string) {
  const themeFiles = Array.from(enumerateFilesRecursive(inputRootPath));

  const outputPathFromSourcePath = (sourcePath: string) => {
    return path.join(rootConfig.outputRootPath, path.relative(inputRootPath, sourcePath));
  };

  // Copy simple assets
  const simpleAssetExtensions = [".css", ".jpg", ".png", ".svg", ".eot", ".ttf", ".woff", ".woff2"];

  themeFiles
    .filter((x) => !path.basename(x).startsWith("_"))
    .filter((x) => simpleAssetExtensions.includes(path.extname(x)))
    .forEach((sourcePath) => {
      const outputPath = outputPathFromSourcePath(sourcePath);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.copyFileSync(sourcePath, outputPath);
    });

  // Process SCSS
  themeFiles
    .filter((x) => !path.basename(x).startsWith("_"))
    .filter((x) => path.extname(x) === ".scss")
    .forEach((sourcePath) => {
      try {
        const compiledScss = sass.compile(sourcePath);

        const outputPath = replaceFileExtension(outputPathFromSourcePath(sourcePath), ".css");
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        fs.writeFileSync(outputPath, compiledScss.css);
      } catch (error) {
        console.error(`While processing ${sourcePath}:`);
        throw error;
      }
    });
}
