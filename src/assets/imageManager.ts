import * as fs from "fs";
import * as path from "path";
import { imageSize } from "image-size";
import sharp from "sharp";
import { isDeepStrictEqual } from "util";

import { RootConfig } from "../config";

export type ImageResizeRequest = {
  width: number;
};

export class ImageManagerImage {
  public readonly width: number;
  public readonly height: number;

  private readonly resizeRequests: Map<string /* siteRelativeOutputPath */, ImageResizeRequest> = new Map();

  constructor(private readonly absoluteImagePath: string) {
    // Read image synchronously (because MarkedJS doesn't let us use async in a renderer and I'm too lazy to use Marked's async `walkTokens`)
    // - Note also that `imageSize()` also is a convenience method for loading an image from a file path;
    //   however, the implementation speculatively only reads the first 512K, expecting it to contain the image header,
    //   which apparently isn't true for all images we use, so just read the whole damn thing.
    const sizeCalculationResult = imageSize(fs.readFileSync(this.absoluteImagePath));

    if (!sizeCalculationResult.width || !sizeCalculationResult.height) {
      throw new Error(`Could not get image size for ${absoluteImagePath}`);
    }

    this.width = sizeCalculationResult.width;
    this.height = sizeCalculationResult.height;
  }

  public resizeImage(siteRelativeOutputPath: string, imageResizeRequest: ImageResizeRequest) {
    const existingRequest = this.resizeRequests.get(siteRelativeOutputPath);

    if (existingRequest) {
      if (!isDeepStrictEqual(imageResizeRequest, existingRequest)) {
        throw new Error(
          `Conflicting resize requests for ${siteRelativeOutputPath}: previously ${JSON.stringify(existingRequest)}, now ${JSON.stringify(imageResizeRequest)}`,
        );
      }
    }

    this.resizeRequests.set(siteRelativeOutputPath, imageResizeRequest);
  }

  public async renderImage(outputRootPath: string) {
    const sharpImage = sharp(this.absoluteImagePath);

    await Promise.all(
      Array.from(this.resizeRequests.entries(), async ([siteRelativeOutputPath, resizeRequest]) => {
        const absoluteOutputPath = path.join(outputRootPath, siteRelativeOutputPath);

        if (fs.existsSync(absoluteOutputPath)) {
          return;
        }

        return sharpImage.resize(resizeRequest).toFile(absoluteOutputPath);
      }),
    );
  }
}

export class ImageManager {
  private readonly images: Map<string /* siteRelativeInputPath */, ImageManagerImage> = new Map();

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

  public async renderImages() {
    await Promise.all(
      Array.from(this.images.entries(), async ([_siteRelativeInputPath, image]) =>
        image.renderImage(this.rootConfig.outputRootPath),
      ),
    );
  }
}
