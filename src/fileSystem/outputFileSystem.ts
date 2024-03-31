import * as fs from "fs";
import * as path from "path";

export class OutputFileSystem {
  private createdOutputDirectories: Set<string>;

  constructor(public readonly outputRootPath: string) {
    this.createdOutputDirectories = new Set<string>();
  }

  public getAbsolutePath(outputRelativePath: string) {
    return path.join(this.outputRootPath, outputRelativePath);
  }

  public ensureOutputPathExists(absoluteOutputPath: string) {
    const dirName = path.dirname(absoluteOutputPath);

    if (!this.createdOutputDirectories.has(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
      this.createdOutputDirectories.add(dirName);

      // ...not caching this by path segment is a minor performance opportunity
      // we'll just leave on the table because it's not (yet) worth it.
    }
  }
}
