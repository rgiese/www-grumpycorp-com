import * as fs from "fs";
import * as path from "path";
import { imageSize } from "image-size";
import sharp from "sharp";

import { RootConfig } from "../config";

export class ImageManagerImage {
  public readonly width: number;
  public readonly height: number;

  private readonly parsedSiteRelativeImagePath: path.ParsedPath;
  private readonly absoluteImagePath: string;

  private readonly requestedWidths: Set<number> = new Set();

  constructor(inputRootPath: string, siteRelativeImagePath: string) {
    this.parsedSiteRelativeImagePath = path.parse(siteRelativeImagePath);
    this.absoluteImagePath = path.join(inputRootPath, siteRelativeImagePath);

    // Read image synchronously (because MarkedJS doesn't let us use async in a renderer and I'm too lazy to use Marked's async `walkTokens`)
    // - Note also that `imageSize()` also is a convenience method for loading an image from a file path;
    //   however, the implementation speculatively only reads the first 512K, expecting it to contain the image header,
    //   which apparently isn't true for all images we use, so just read the whole damn thing.
    const sizeCalculationResult = imageSize(fs.readFileSync(this.absoluteImagePath));

    if (!sizeCalculationResult.width || !sizeCalculationResult.height) {
      throw new Error(`Could not get image size for ${this.absoluteImagePath}`);
    }

    this.width = sizeCalculationResult.width;
    this.height = sizeCalculationResult.height;
  }

  public resizeImage(width: number) {
    this.requestedWidths.add(width);
  }

  public getResizedSiteRelativeImagePath(width: number, ext?: string): string {
    return path.format({
      ...this.parsedSiteRelativeImagePath,
      base: undefined /* so `name` is used */,
      name: `${this.parsedSiteRelativeImagePath.name}-${width}w`,
      ext: ext ?? this.parsedSiteRelativeImagePath.ext,
    });
  }

  public async renderImage(additionalFormats: string[], outputRootPath: string) {
    const outputExtensions = [
      this.parsedSiteRelativeImagePath.ext /* use original format */,
      ...additionalFormats.map((format) => `.${format}`),
    ];

    const sourceImageStats = fs.statSync(this.absoluteImagePath);
    const sharpImage = sharp(this.absoluteImagePath);

    await Promise.all(
      Array.from(this.requestedWidths, (width) =>
        outputExtensions.map((extension) => {
          const absoluteOutputPath = path.join(outputRootPath, this.getResizedSiteRelativeImagePath(width, extension));

          const outputImageStats = fs.statSync(absoluteOutputPath, { throwIfNoEntry: false });

          if (outputImageStats && sourceImageStats.mtimeMs < outputImageStats.mtimeMs) {
            return;
          }

          return sharpImage.resize(width).toFile(absoluteOutputPath);
        }),
      ).flatMap((p) => p),
    );
  }
}

export class ImageManager {
  private readonly images: Map<string /* siteRelativeImagePath */, ImageManagerImage> = new Map();

  constructor(private readonly rootConfig: RootConfig) {}

  public getImage(siteRelativeImagePath: string): ImageManagerImage {
    const existingImage = this.images.get(siteRelativeImagePath);

    if (existingImage) {
      return existingImage;
    }

    const image = new ImageManagerImage(this.rootConfig.inputRootPath, siteRelativeImagePath);
    this.images.set(siteRelativeImagePath, image);

    return image;
  }

  get additionalFormats() {
    return [/* "avif", */ "webp"]; // avif is fantastically slow to generate
  }

  public async renderImages() {
    await Promise.all(
      Array.from(this.images.entries(), async ([_siteRelativeInputPath, image]) =>
        image.renderImage(this.additionalFormats, this.rootConfig.outputRootPath),
      ),
    );
  }
}
