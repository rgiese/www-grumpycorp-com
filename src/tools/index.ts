import * as path from "path";
import * as fs from "fs";

export function* enumerateFilesRecursive(dir: string, extension?: string): Generator<string> {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const absolutePath = path.join(file.path, file.name);

    if (file.isDirectory()) {
      yield* enumerateFilesRecursive(absolutePath, extension);
    } else if (!extension || path.extname(file.name) === extension) {
      yield absolutePath;
    }
  }
}
