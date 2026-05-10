import fs from "node:fs/promises";
import path from "node:path";
import svgo from "svgo";

import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import postcssImport from "postcss-import";

import { SvgToCssConfig } from "../config";
import { getFileSystemStat, OutputFileSystem, siteBuildId } from "../fileSystem";
import { ImageManager, ImageManagerImage } from "./imageManager";
import { FileSpec } from "../types";

export { ImageManager, ImageManagerImage };

function replaceFileExtension(originalPath: path.ParsedPath, revisedExtension: string): string {
  return path.format({ ...originalPath, base: undefined /* so `ext` is used */, ext: revisedExtension });
}

export async function processAssets(
  sourceFiles: FileSpec[],
  outputFileSystem: OutputFileSystem,
  minifyOutput: boolean,
  forceRegenerateCss = false,
) {
  const explicitAssetSourceFiles = sourceFiles.filter((f) => !f.parsedRootRelativePath.base.startsWith("_"));

  // Copy simple assets
  const simpleAssetExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".svg",
    ".eot",
    ".ttf",
    ".woff",
    ".woff2",
    ".txt",
    ".stl",
    ".f3d",
  ];

  await Promise.all(
    explicitAssetSourceFiles
      .filter((f) => simpleAssetExtensions.includes(f.parsedRootRelativePath.ext.toLowerCase()))
      .map(async (sourceFile) => {
        try {
          // Set up paths
          const sourceFileStat = getFileSystemStat(sourceFile.absolutePath, { requireExists: true });

          const outputPath = outputFileSystem.getAbsolutePath(sourceFile.rootRelativePath);
          const outputFileStat = getFileSystemStat(outputPath, { requireExists: false });

          if (outputFileStat && sourceFileStat.mtimeMs < outputFileStat.mtimeMs) {
            return;
          }

          // Process content
          outputFileSystem.ensureOutputPathExists(outputPath);
          await fs.copyFile(sourceFile.absolutePath, outputPath);
        } catch (error) {
          console.error(`While processing ${sourceFile.absolutePath}:`);
          throw error;
        }
      }),
  );

  // Process CSS
  await Promise.all(
    explicitAssetSourceFiles
      .filter((f) => f.parsedRootRelativePath.ext === ".css")
      .map(async (sourceFile) => {
        try {
          // Set up paths
          const sourceFileStat = getFileSystemStat(sourceFile.absolutePath, { requireExists: true });

          const outputPath = outputFileSystem.getAbsolutePath(
            replaceFileExtension(sourceFile.parsedRootRelativePath, `${siteBuildId}.css`),
          );
          const outputFileStat = getFileSystemStat(outputPath, { requireExists: false });

          if (!forceRegenerateCss && outputFileStat && sourceFileStat.mtimeMs < outputFileStat.mtimeMs) {
            return;
          }

          // Process content
          const inputCss = await fs.readFile(sourceFile.absolutePath, "utf8");

          const compiledCss = await postcss([
            postcssImport({
              path: [outputFileSystem.outputRootPath], // for generated SVG->CSS files
              filter: (importPath) => importPath !== "tailwindcss", // let Tailwind handle its own directive
            }),
            tailwindcss({ base: outputFileSystem.outputRootPath, optimize: minifyOutput ? { minify: true } : false }),
            autoprefixer(),
          ]).process(inputCss, {
            from: sourceFile.absolutePath,
            to: outputPath,
          });

          outputFileSystem.ensureOutputPathExists(outputPath);
          await fs.writeFile(outputPath, compiledCss.css);

          // Write source map if available
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- result.map is typed incorrectly, can be undefined
          const sourceMap = compiledCss.map?.toString();
          if (sourceMap) {
            await fs.writeFile(outputPath + ".map", sourceMap);
          }
        } catch (error) {
          console.error(`While processing ${sourceFile.absolutePath}:`);
          throw error;
        }
      }),
  );
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

  Array.from(charactersToConvert).forEach((characterToConvert) => {
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

export async function transcodeSvgsToCss(
  sourceFiles: FileSpec[],
  outputFileSystem: OutputFileSystem,
  svgToCssConfig: SvgToCssConfig,
) {
  const svgDocuments = sourceFiles
    .filter((f) => f.rootRelativePath.startsWith(svgToCssConfig.inputRootRelativePath))
    .filter((f) => f.parsedRootRelativePath.ext === ".svg");

  const cssContent = (
    await Promise.all(
      svgDocuments.map(async (sourceFile) => {
        try {
          return cssFromSvg(sourceFile.parsedRootRelativePath.name, await fs.readFile(sourceFile.absolutePath, "utf8"));
        } catch (error) {
          console.error(`While processing ${sourceFile.absolutePath}:`);
          throw error;
        }
      }),
    )
  ).join("\n");

  const outputPath = outputFileSystem.getAbsolutePath(svgToCssConfig.siteRelativeOutputPath);
  outputFileSystem.ensureOutputPathExists(outputPath);
  await fs.writeFile(outputPath, cssContent);
}
