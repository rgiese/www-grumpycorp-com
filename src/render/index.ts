import * as path from "path";
import * as fs from "fs";

import { RootConfig, DocumentGroupConfig } from "../config";
import { InputDocument, InputDocumentGroup } from "../input";

function renderDocument(config: RootConfig, documentGroupConfig: DocumentGroupConfig, inputDocument: InputDocument) {
  // Compute output path
  const siteRelativeOutputPath = documentGroupConfig.ouputPathFromDocumentPath(inputDocument);

  if (!siteRelativeOutputPath.startsWith("/")) {
    throw new Error(
      `Output path ${siteRelativeOutputPath} for document ${inputDocument.documentRelativePath} should start with '/'`,
    );
  }

  const outputPath = path.join(config.outputRootPath, siteRelativeOutputPath);

  console.log(`${inputDocument.documentRelativePath} -> ${siteRelativeOutputPath} -> ${outputPath}`);

  // Ensure output directory exists
  const outputDirectory = path.dirname(outputPath);

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  // TODO: Render

  // Output
  fs.writeFileSync(outputPath, inputDocument.documentContent);
}

function renderDocumentGroup(rootConfig: RootConfig, inputDocumentGroup: InputDocumentGroup) {
  inputDocumentGroup.documents.forEach((d) => renderDocument(rootConfig, inputDocumentGroup.documentGroupConfig, d));
}

export function renderSite(config: RootConfig, inputDocumentGroups: InputDocumentGroup[]) {
  inputDocumentGroups.forEach((g) => renderDocumentGroup(config, g));
}
