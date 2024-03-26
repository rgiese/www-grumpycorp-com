import * as path from "path";
import * as fs from "fs";
import { Eta } from "eta";
import { Marked } from "marked";

import { RootConfig } from "../config";
import { InputDocument, InputDocumentGroup } from "../input";
import { OutputFileSystem } from "../fileSystem";

function renderDocument(
  inputDocumentGroup: InputDocumentGroup,
  inputDocument: InputDocument,
  marked: Marked,
  eta: Eta,
  outputFileSystem: OutputFileSystem,
) {
  const outputPath = outputFileSystem.getAbsolutePath(inputDocument.siteRelativeOutputPath);
  outputFileSystem.ensureOutputPathExists(outputPath);

  console.log(`${inputDocument.documentGroupRelativePath} -> ${inputDocument.siteRelativeOutputPath} -> ${outputPath}`);

  try {
    // Render content
    const contentHtml = marked.parse(inputDocument.content) as string;

    // Render template
    const templateRenderContext = inputDocumentGroup.documentGroupConfig.templateRenderContext?.(
      inputDocument,
      inputDocumentGroup.documents,
    );

    const pageHtml = eta.render(inputDocumentGroup.documentGroupConfig.templateName, {
      // Site-provided context (bring this in first so it can't override "official" fields)
      ...templateRenderContext,
      // This document
      inputDocument,
      contentHtml,
      // All documents
      inputDocumentGroup,
      // API
      api: {
        path,
      },
    });

    // Output
    fs.writeFileSync(outputPath, pageHtml);
  } catch (error) {
    console.error(`While creating ${outputPath} from ${inputDocument.documentGroupRelativePath}:`);
    console.error(`with frontmatter: ${JSON.stringify(inputDocument.frontMatter)}`);
    throw error;
  }
}

function renderDocumentGroup(
  rootConfig: RootConfig,
  inputDocumentGroup: InputDocumentGroup,
  marked: Marked,
  outputFileSystem: OutputFileSystem,
) {
  const eta = new Eta({ views: rootConfig.themeRootPath, varName: "data", debug: true });

  inputDocumentGroup.documents.forEach((d) => renderDocument(inputDocumentGroup, d, marked, eta, outputFileSystem));
}

export function renderSite(
  rootConfig: RootConfig,
  inputDocumentGroups: InputDocumentGroup[],
  outputFileSystem: OutputFileSystem,
) {
  const marked = new Marked({ pedantic: false });

  inputDocumentGroups.forEach((g) => renderDocumentGroup(rootConfig, g, marked, outputFileSystem));
}
