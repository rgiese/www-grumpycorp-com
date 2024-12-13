import * as fs from "fs";

import { OutputFileSystem } from "../fileSystem";
import { Redirect } from "../config";

export function processRedirects(outputFileSystem: OutputFileSystem, redirects: Redirect[]) {
  // Create redirects for Cloudflare Pages
  const outputPath = outputFileSystem.getAbsolutePath("/_redirects");

  fs.writeFileSync(
    outputPath,
    redirects.map((redirect) => `${redirect.source} ${redirect.destination} ${redirect.code ?? 302}`).join("\n"),
  );
}
