import * as fs from "fs";

import { OutputFileSystem } from "../fileSystem";
import { Redirect } from "../config";

export function processRedirects(outputFileSystem: OutputFileSystem, redirects: Redirect[]) {
  //
  // Create redirects for Cloudflare Pages
  //

  // Validate
  redirects.forEach((redirect) => {
    const throwOnInvalid = (field: "source" | "destination") => {
      const url = redirect[field];

      if (!(url.startsWith("/") || url.startsWith("https://"))) {
        throw new Error(`Redirect ${field} ${url} needs to be site-absolute (/...) or begin with https://`);
      }
    };

    throwOnInvalid("source");
    throwOnInvalid("destination");
  });

  // Output
  const outputPath = outputFileSystem.getAbsolutePath("/_redirects");

  fs.writeFileSync(
    outputPath,
    redirects.map((redirect) => `${redirect.source} ${redirect.destination} ${redirect.code ?? 302}`).join("\n"),
  );
}
