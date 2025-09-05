import * as fs from "fs";
import * as path from "path";

import { FileSpec } from "../types";

export function* enumerateFilesRecursive(rootPath: string, dir: string): Generator<FileSpec> {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const absolutePath = path.join(file.parentPath, file.name);

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
