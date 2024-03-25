import * as fs from "fs";
import * as path from "path";
import * as sass from "sass";

import { RootConfig } from "../config";
import { SourceFile } from "../fileSystem";

function replaceFileExtension(originalPath: path.ParsedPath, revisedExtension: string): string {
  return path.format({ ...originalPath, base: undefined /* so `ext` is used */, ext: revisedExtension });
}

export function processAssets(rootConfig: RootConfig, sourceFiles: SourceFile[]) {
  // Copy simple assets
  const simpleAssetExtensions = [".css", ".jpg", ".png", ".svg", ".eot", ".ttf", ".woff", ".woff2"];

  sourceFiles
    .filter((f) => !f.parsedRootRelativePath.base.startsWith("_"))
    .filter((f) => simpleAssetExtensions.includes(f.parsedRootRelativePath.ext))
    .forEach((sourceFile) => {
      const outputPath = path.join(rootConfig.outputRootPath, sourceFile.rootRelativePath);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.copyFileSync(sourceFile.absolutePath, outputPath);
    });

  // Process SCSS
  sourceFiles
    .filter((f) => !f.parsedRootRelativePath.base.startsWith("_"))
    .filter((f) => f.parsedRootRelativePath.ext === ".scss")
    .forEach((sourceFile) => {
      try {
        const compiledScss = sass.compile(sourceFile.absolutePath);

        const outputPath = path.join(
          rootConfig.outputRootPath,
          replaceFileExtension(sourceFile.parsedRootRelativePath, ".css"),
        );

        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, compiledScss.css);
      } catch (error) {
        console.error(`While processing ${sourceFile.absolutePath}:`);
        throw error;
      }
    });
}
