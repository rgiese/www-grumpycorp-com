import { getFileSystemStat } from "./fileSystemStat";
import { SourceFileSystem, createSourceFileSystem, repoRootPath } from "./sourceFileSystem";
import { OutputFileSystem } from "./outputFileSystem";
import { execSync } from "child_process";

export { getFileSystemStat };
export { SourceFileSystem, createSourceFileSystem, repoRootPath };
export { OutputFileSystem };

export const siteBuildId = execSync("git rev-parse --short HEAD").toString().trim();
