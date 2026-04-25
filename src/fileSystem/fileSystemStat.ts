import * as fs from "fs";

// Wrap fs.Stats in an object so we can store `fsStats | undefined` in a map
interface FileStats {
  fsStats?: fs.Stats;
}

const pathToStats = new Map<string, FileStats>();

export function getFileSystemStat(absolutePath: string, { requireExists }: { requireExists: true }): fs.Stats;

export function getFileSystemStat(
  absolutePath: string,
  { requireExists }: { requireExists: false },
): fs.Stats | undefined;

export function getFileSystemStat(
  absolutePath: string,
  { requireExists }: { requireExists: boolean },
): fs.Stats | undefined {
  const existingStats = pathToStats.get(absolutePath);

  if (existingStats) {
    if (!existingStats.fsStats && requireExists) {
      throw new Error(`Could not get stats for file ${absolutePath}`);
    }

    return existingStats.fsStats;
  }

  const stats = fs.statSync(absolutePath, { throwIfNoEntry: false });

  if (stats) {
    pathToStats.set(absolutePath, { fsStats: stats });
  }

  return stats;
}
