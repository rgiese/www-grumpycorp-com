import * as fs from "fs";

// Wrap fs.Stats in an object so we can store `fsStats | undefined` in a map
type FileStats = {
  FsStats?: fs.Stats;
};

export class FileSystemStat {
  static pathToStats = new Map<string, FileStats>();

  static get(absolutePath: string, { requireExists }: { requireExists: true }): fs.Stats;

  static get(absolutePath: string, { requireExists }: { requireExists: false }): fs.Stats | undefined;

  static get(absolutePath: string, { requireExists }: { requireExists: boolean }): fs.Stats | undefined {
    const existingStats = this.pathToStats.get(absolutePath);

    if (existingStats) {
      if (!existingStats.FsStats && requireExists) {
        throw new Error(`Could not get stats for file ${absolutePath}`);
      }

      return existingStats.FsStats;
    }

    const stats = fs.statSync(absolutePath, { throwIfNoEntry: false });

    if (stats) {
      this.pathToStats.set(absolutePath, { FsStats: stats });
    }

    return stats;
  }
}
