import * as fs from "fs";
import * as path from "path";

import { RootConfig } from "../config";

export type SourceFile = {
  rootRelativePath: string;
  parsedRootRelativePath: path.ParsedPath;
  absolutePath: string;
};

export type SourceFileSystem = {
  inputFiles: SourceFile[];
  themeFiles: SourceFile[];
};

function* enumerateFilesRecursive(rootPath: string, dir: string): Generator<SourceFile> {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const absolutePath = path.join(file.path, file.name);

    if (file.isDirectory()) {
      yield* enumerateFilesRecursive(rootPath, absolutePath);
    } else {
      const rootRelativePath = path.relative(rootPath, absolutePath);

      yield {
        rootRelativePath,
        parsedRootRelativePath: path.parse(rootRelativePath),
        absolutePath,
      };
    }
  }
}

function createSourceFiles(rootPath: string): SourceFile[] {
  return Array.from(enumerateFilesRecursive(rootPath, rootPath));
}

export function createSourceFileSystem(rootConfig: RootConfig): SourceFileSystem {
  return {
    inputFiles: createSourceFiles(rootConfig.inputRootPath),
    themeFiles: createSourceFiles(rootConfig.themeRootPath),
  };
}
