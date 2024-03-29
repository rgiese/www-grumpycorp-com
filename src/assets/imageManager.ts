import * as fs from "fs";
import * as path from "path";
import { imageSize } from "image-size";

import { RootConfig } from "../config";

export class ImageManagerImage {
  public readonly width: number;
  public readonly height: number;

  constructor(private readonly imagePath: string) {
    // Read image synchronously (because MarkedJS doesn't let us use async in a renderer and I'm too lazy to use Marked's async `walkTokens`)
    // - Note also that `imageSize()` also is a convenience method for loading an image from a file path;
    //   however, the implementation speculatively only reads the first 512K, expecting it to contain the image header,
    //   which apparently isn't true for all images we use, so just read the whole damn thing.
    const sizeCalculationResult = imageSize(fs.readFileSync(this.imagePath));

    if (!sizeCalculationResult.width || !sizeCalculationResult.height) {
      throw new Error(`Could not get image size for ${imagePath}`);
    }

    this.width = sizeCalculationResult.width;
    this.height = sizeCalculationResult.height;
  }
}

export class ImageManager {
  private readonly images: Map<string, ImageManagerImage> = new Map();

  constructor(private readonly rootConfig: RootConfig) {}

  public getImage(siteRelativeInputPath: string): ImageManagerImage {
    const existingImage = this.images.get(siteRelativeInputPath);

    if (existingImage) {
      return existingImage;
    }

    const image = new ImageManagerImage(path.join(this.rootConfig.inputRootPath, siteRelativeInputPath));
    this.images.set(siteRelativeInputPath, image);

    return image;
  }
}
