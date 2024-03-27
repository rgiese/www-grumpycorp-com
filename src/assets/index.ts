import { Buffer } from "node:buffer";
import * as fs from "fs";
import * as path from "path";
import * as sass from "sass";
import minifyHtml from "@minify-html/node";

import { OutputFileSystem, FileSpec } from "../fileSystem";

function replaceFileExtension(originalPath: path.ParsedPath, revisedExtension: string): string {
  return path.format({ ...originalPath, base: undefined /* so `ext` is used */, ext: revisedExtension });
}

export function processAssets(sourceFiles: FileSpec[], outputFileSystem: OutputFileSystem, minifyOutput: boolean) {
  const explicitAssetSourceFiles = sourceFiles.filter((f) => !f.parsedRootRelativePath.base.startsWith("_"));

  // Copy simple assets
  const simpleAssetExtensions = [".jpg", ".png", ".svg", ".eot", ".ttf", ".woff", ".woff2"];

  explicitAssetSourceFiles
    .filter((f) => simpleAssetExtensions.includes(f.parsedRootRelativePath.ext))
    .forEach((sourceFile) => {
      const outputPath = outputFileSystem.getAbsolutePath(sourceFile.rootRelativePath);

      outputFileSystem.ensureOutputPathExists(outputPath);
      fs.copyFileSync(sourceFile.absolutePath, outputPath);
    });

  // Process CSS
  explicitAssetSourceFiles
    .filter((f) => f.parsedRootRelativePath.ext === ".css")
    .forEach((sourceFile) => {
      try {
        const inputCss = fs.readFileSync(sourceFile.absolutePath);
        const outputCss = minifyOutput ? minifyHtml.minify(inputCss, { keep_comments: false }) : inputCss;

        const outputPath = outputFileSystem.getAbsolutePath(sourceFile.rootRelativePath);

        outputFileSystem.ensureOutputPathExists(outputPath);
        fs.writeFileSync(outputPath, outputCss);
      } catch (error) {
        console.error(`While processing ${sourceFile.absolutePath}:`);
        throw error;
      }
    });

  // Process SCSS
  explicitAssetSourceFiles
    .filter((f) => f.parsedRootRelativePath.ext === ".scss")
    .forEach((sourceFile) => {
      try {
        const compiledScss = sass.compile(sourceFile.absolutePath);
        const outputScss = minifyOutput ? minifyHtml.minify(Buffer.from(compiledScss.css), {}) : compiledScss.css;

        const outputPath = outputFileSystem.getAbsolutePath(
          replaceFileExtension(sourceFile.parsedRootRelativePath, ".css"),
        );

        outputFileSystem.ensureOutputPathExists(outputPath);
        fs.writeFileSync(outputPath, outputScss);
      } catch (error) {
        console.error(`While processing ${sourceFile.absolutePath}:`);
        throw error;
      }
    });
}
