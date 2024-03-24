import * as path from "path";
import * as fs from "fs";
import { Marked } from "marked";

import { RootConfig, DocumentGroupConfig } from "../config";
import { InputDocument, InputDocumentGroup } from "../input";

function renderDocument(
  config: RootConfig,
  documentGroupConfig: DocumentGroupConfig,
  inputDocument: InputDocument,
  marked: Marked,
) {
  // Compute output path
  const inputDocumentRelativePath = path.parse(inputDocument.relativePath);

  const siteRelativeOutputPath = path.join(
    documentGroupConfig.documentGroupName,
    inputDocumentRelativePath.dir,
    inputDocumentRelativePath.name,
    "index.html",
  );

  const outputPath = path.join(config.outputRootPath, siteRelativeOutputPath);

  console.log(`${inputDocument.relativePath} -> ${siteRelativeOutputPath} -> ${outputPath}`);

  // Ensure output directory exists
  const outputDirectory = path.dirname(outputPath);

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  // Render
  const contentHtml = marked.parse(inputDocument.content) as string;

  // Output
  fs.writeFileSync(outputPath, contentHtml);
}

function renderDocumentGroup(rootConfig: RootConfig, inputDocumentGroup: InputDocumentGroup, marked: Marked) {
  inputDocumentGroup.documents.forEach((d) =>
    renderDocument(rootConfig, inputDocumentGroup.documentGroupConfig, d, marked),
  );
}

export function renderSite(config: RootConfig, inputDocumentGroups: InputDocumentGroup[]) {
  const marked = new Marked({ pedantic: false });

  inputDocumentGroups.forEach((g) => renderDocumentGroup(config, g, marked));
}
