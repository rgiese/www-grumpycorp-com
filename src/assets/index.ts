import { Buffer } from "node:buffer";
import * as fs from "fs";
import minifyHtml from "@minify-html/node";
import * as path from "path";
import * as sass from "sass";
import sharp from "sharp";

import { OutputFileSystem, FileSpec } from "../fileSystem";
import { sourceSetSizes, getResizedImageName } from "./imageResizing";

function replaceFileExtension(originalPath: path.ParsedPath, revisedExtension: string): string {
  return path.format({ ...originalPath, base: undefined /* so `ext` is used */, ext: revisedExtension });
}

async function processImageAsset(sourceFile: FileSpec, outputFileSystem: OutputFileSystem) {
  const parsedOutputPath = path.parse(outputFileSystem.getAbsolutePath(sourceFile.rootRelativePath));

  const sourceSharp = sharp(sourceFile.absolutePath);

  await Promise.all(
    sourceSetSizes.map((size) => {
      const resizedOutputPath = getResizedImageName(parsedOutputPath, size);

      if (fs.existsSync(resizedOutputPath)) {
        // We'll anticipate that the source file hasn't changed so we won't re-generate.
        // (If the source file did change, just wipe the output directory.)
        return;
      }

      return sourceSharp.resize(size).toFile(resizedOutputPath);
    }),
  );
}

export async function processAssets(
  sourceFiles: FileSpec[],
  outputFileSystem: OutputFileSystem,
  minifyOutput: boolean,
) {
  const explicitAssetSourceFiles = sourceFiles.filter((f) => !f.parsedRootRelativePath.base.startsWith("_"));

  // Copy simple assets
  const imageAssetExtensions = [".jpg", ".png"];
  const simpleAssetExtensions = [...imageAssetExtensions, ".svg", ".eot", ".ttf", ".woff", ".woff2", ".txt"];

  await Promise.all(
    explicitAssetSourceFiles
      .filter((f) => simpleAssetExtensions.includes(f.parsedRootRelativePath.ext))
      .map((sourceFile) => {
        const outputPath = outputFileSystem.getAbsolutePath(sourceFile.rootRelativePath);

        outputFileSystem.ensureOutputPathExists(outputPath);
        fs.copyFileSync(sourceFile.absolutePath, outputPath);

        if (imageAssetExtensions.includes(sourceFile.parsedRootRelativePath.ext)) {
          return processImageAsset(sourceFile, outputFileSystem);
        }
      }),
  );

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
        const compiledScss = sass.compile(sourceFile.absolutePath, {
          loadPaths: [path.resolve("node_modules")],
        });

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
