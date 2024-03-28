import * as path from "path";

// Configuration for our image pipeline, more or less as recommended by https://ausi.github.io/respimagelint/linter.html
export const sourceSetSizes = [
  570, // for vertical images
  768,
  970, // for vertical images
  1210,
  1536,
];

export function getResizedImageName(parsedImagePath: path.ParsedPath, size: number): string {
  return path.format({
    ...parsedImagePath,
    base: undefined /* so `name` is used */,
    name: `${parsedImagePath.name}-${size}w`,
  });
}
