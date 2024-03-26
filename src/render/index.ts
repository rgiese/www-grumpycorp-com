import * as path from "path";
import * as fs from "fs";
import { Eta } from "eta";
import { Marked } from "marked";

import { RootConfig, DocumentGroupConfig } from "../config";
import { InputDocument, InputDocumentGroup } from "../input";
import { OutputFileSystem } from "../fileSystem";

function renderDocument(
  documentGroupConfig: DocumentGroupConfig,
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
    const pageHtml = eta.render(documentGroupConfig.templateName, {
      inputDocument,
      contentHtml,
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

  inputDocumentGroup.documents.forEach((d) =>
    renderDocument(inputDocumentGroup.documentGroupConfig, d, marked, eta, outputFileSystem),
  );
}

export function renderSite(
  rootConfig: RootConfig,
  inputDocumentGroups: InputDocumentGroup[],
  outputFileSystem: OutputFileSystem,
) {
  const marked = new Marked({ pedantic: false });

  inputDocumentGroups.forEach((g) => renderDocumentGroup(rootConfig, g, marked, outputFileSystem));
}
