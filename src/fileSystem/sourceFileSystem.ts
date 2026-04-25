import { RootConfig } from "../config";
import { enumerateFilesRecursive } from "./enumerateFiles";
import { FileSpec } from "../types";
import path from "node:path";

export { FileSpec };

export interface SourceFileSystem {
  inputFiles: FileSpec[];
  themeFiles: FileSpec[];
}

function createSourceFiles(rootPath: string): FileSpec[] {
  return Array.from(enumerateFilesRecursive(rootPath, rootPath));
}

export function createSourceFileSystem(rootConfig: RootConfig): SourceFileSystem {
  return {
    inputFiles: createSourceFiles(rootConfig.inputRootPath),
    themeFiles: createSourceFiles(rootConfig.themeRootPath),
  };
}

export const repoRootPath = path.resolve("."); // By virtue of being executed from the repo root
