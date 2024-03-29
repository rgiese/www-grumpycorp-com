import { RootConfig } from "../config";
import { enumerateFilesRecursive } from "./enumerateFiles";
import { FileSpec } from "../types";

export { FileSpec };

export type SourceFileSystem = {
  inputFiles: FileSpec[];
  themeFiles: FileSpec[];
};

function createSourceFiles(rootPath: string): FileSpec[] {
  return Array.from(enumerateFilesRecursive(rootPath, rootPath));
}

export function createSourceFileSystem(rootConfig: RootConfig): SourceFileSystem {
  return {
    inputFiles: createSourceFiles(rootConfig.inputRootPath),
    themeFiles: createSourceFiles(rootConfig.themeRootPath),
  };
}
