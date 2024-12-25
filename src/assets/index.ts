import * as fs from "fs";
import htmlMinifier from "html-minifier";
import * as path from "path";
import * as sass from "sass";
import svgo from "svgo";

import { SvgToCssConfig } from "../config";
import { FileSystemStat, OutputFileSystem } from "../fileSystem";
import { ImageManager, ImageManagerImage } from "./imageManager";
import { FileSpec } from "../types";
import { minifyOptions } from "../render/minifyOptions";

export { ImageManager, ImageManagerImage };

function replaceFileExtension(originalPath: path.ParsedPath, revisedExtension: string): string {
  return path.format({ ...originalPath, base: undefined /* so `ext` is used */, ext: revisedExtension });
}

export function processAssets(sourceFiles: FileSpec[], outputFileSystem: OutputFileSystem, minifyOutput: boolean) {
  const explicitAssetSourceFiles = sourceFiles.filter((f) => !f.parsedRootRelativePath.base.startsWith("_"));

  // Copy simple assets
  const simpleAssetExtensions = [".jpg", ".png", ".svg", ".eot", ".ttf", ".woff", ".woff2", ".txt", ".stl", ".f3d"];

  explicitAssetSourceFiles
    .filter((f) => simpleAssetExtensions.includes(f.parsedRootRelativePath.ext.toLowerCase()))
    .forEach((sourceFile) => {
      // Set up paths
      const sourceFileStat = FileSystemStat.get(sourceFile.absolutePath, { requireExists: true });

      const outputPath = outputFileSystem.getAbsolutePath(sourceFile.rootRelativePath);
      const outputFileStat = FileSystemStat.get(outputPath, { requireExists: false });

      if (outputFileStat && sourceFileStat.mtimeMs < outputFileStat.mtimeMs) {
        return;
      }

      // Process content
      outputFileSystem.ensureOutputPathExists(outputPath);
      fs.copyFileSync(sourceFile.absolutePath, outputPath);
    });

  // Process CSS
  explicitAssetSourceFiles
    .filter((f) => f.parsedRootRelativePath.ext === ".css")
    .forEach((sourceFile) => {
      try {
        // Set up paths
        const sourceFileStat = FileSystemStat.get(sourceFile.absolutePath, { requireExists: true });

        const outputPath = outputFileSystem.getAbsolutePath(sourceFile.rootRelativePath);
        const outputFileStat = FileSystemStat.get(outputPath, { requireExists: false });

        if (outputFileStat && sourceFileStat.mtimeMs < outputFileStat.mtimeMs) {
          return;
        }

        // Process content
        const inputCss = fs.readFileSync(sourceFile.absolutePath).toString();
        const outputCss = minifyOutput ? htmlMinifier.minify(inputCss, minifyOptions) : inputCss;

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
        // Set up paths
        const sourceFileStat = FileSystemStat.get(sourceFile.absolutePath, { requireExists: true });

        const outputPath = outputFileSystem.getAbsolutePath(
          replaceFileExtension(sourceFile.parsedRootRelativePath, ".css"),
        );
        const outputFileStat = FileSystemStat.get(outputPath, { requireExists: false });

        if (outputFileStat && sourceFileStat.mtimeMs < outputFileStat.mtimeMs) {
          return;
        }

        // Process content
        const compiledScss = sass.compile(sourceFile.absolutePath, {
          loadPaths: [
            path.resolve("node_modules"),
            outputFileSystem.outputRootPath, // for generated SVG->CSS files
          ],
          style: minifyOutput ? "compressed" : "expanded",
        });

        outputFileSystem.ensureOutputPathExists(outputPath);
        fs.writeFileSync(outputPath, compiledScss.css);
      } catch (error) {
        console.error(`While processing ${sourceFile.absolutePath}:`);
        throw error;
      }
    });
}

function cssFromSvg(name: string, inputSvg: string): string {
  // Capture viewBox attribute from input SVG and also optimize the SVG code while we're at it
  let viewBoxAttributeValue = "";

  const captureViewBox: svgo.CustomPlugin = {
    name: "captureViewBox",
    fn: () => {
      return {
        element: {
          enter: (node) => {
            if (node.name === "svg") {
              viewBoxAttributeValue = node.attributes.viewBox;
            }
          },
        },
      };
    },
  };

  const optimizedSvg = svgo.optimize(inputSvg, { multipass: true, plugins: ["preset-default", captureViewBox] }).data;

  // Parse viewBox
  if (!viewBoxAttributeValue) {
    throw new Error(`viewBox attribute not found`);
  }

  const viewBoxParsedValues = viewBoxAttributeValue.split(" ").map((x) => parseInt(x));

  if (viewBoxParsedValues.length !== 4) {
    throw new Error(`viewBox attribute value "${viewBoxAttributeValue}" invalid`);
  }

  // Encode SVG so we can use it in a CSS data url
  let encodedSvg = optimizedSvg
    .replaceAll("\n", " ") // no newlines allowed in CSS
    .replaceAll("'", '"'); // we'll contain with single quotes below so transform in-SVG single quotes to double quotes

  const charactersToConvert = "%&#{}<>"; // courtesy of https://codepen.io/jakob-e/pen/doMoML. Note that '%' _has_ to come first.

  [...charactersToConvert].forEach((characterToConvert) => {
    encodedSvg = encodedSvg.replaceAll(
      characterToConvert,
      `%${characterToConvert.charCodeAt(0).toString(16).padStart(2, "0")}`,
    );
  });

  // Emit CSS class
  return `.svg-${name} {
    background: url('data:image/svg+xml,${encodedSvg}') no-repeat top left;
    background-size: contain;
    aspect-ratio: ${viewBoxParsedValues[2 /* width */]} / ${viewBoxParsedValues[3 /* height */]};  
  }`;
}

export function transcodeSvgsToCss(
  sourceFiles: FileSpec[],
  outputFileSystem: OutputFileSystem,
  svgToCssConfig: SvgToCssConfig,
) {
  const svgDocuments = sourceFiles
    .filter((f) => f.rootRelativePath.startsWith(svgToCssConfig.inputRootRelativePath))
    .filter((f) => f.parsedRootRelativePath.ext === ".svg");

  const cssContent = svgDocuments
    .map((sourceFile) => {
      try {
        return cssFromSvg(sourceFile.parsedRootRelativePath.name, fs.readFileSync(sourceFile.absolutePath, "utf8"));
      } catch (error) {
        console.error(`While processing ${sourceFile.absolutePath}:`);
        throw error;
      }
    })
    .join("\n");

  const outputPath = outputFileSystem.getAbsolutePath(svgToCssConfig.siteRelativeOutputPath);
  outputFileSystem.ensureOutputPathExists(outputPath);
  fs.writeFileSync(outputPath, cssContent);
}
