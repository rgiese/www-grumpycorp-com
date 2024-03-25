import * as path from "path";
import * as fs from "fs";
import { Eta } from "eta";
import { Marked } from "marked";

import { RootConfig, DocumentGroupConfig } from "../config";
import { InputDocument, InputDocumentGroup } from "../input";

function renderDocument(
  config: RootConfig,
  documentGroupConfig: DocumentGroupConfig,
  inputDocument: InputDocument,
  marked: Marked,
  eta: Eta,
) {
  // Compute output path
  const siteRelativeOutputPath = documentGroupConfig.ouputPathFromDocumentPath(inputDocument);
  const outputPath = path.join(config.outputRootPath, siteRelativeOutputPath);

  console.log(`${inputDocument.relativePath} -> ${siteRelativeOutputPath} -> ${outputPath}`);

  // Ensure output directory exists
  const outputDirectory = path.dirname(outputPath);

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  try {
    // Render content
    const contentHtml = marked.parse(inputDocument.content) as string;

    // Render template
    const pageHtml = eta.render(documentGroupConfig.templateName, {
      inputDocument: {
        documentGroupName: documentGroupConfig.documentGroupName,
        relativePath: inputDocument.relativePath,
        frontMatter: inputDocument.frontMatter,
      },
      content: contentHtml,
    });

    // Output
    fs.writeFileSync(outputPath, pageHtml);
  } catch (error) {
    console.error(`While creating ${outputPath} from ${inputDocument.relativePath}:`);
    console.error(`with frontmatter: ${JSON.stringify(inputDocument.frontMatter)}`);
    throw error;
  }
}

function renderDocumentGroup(rootConfig: RootConfig, inputDocumentGroup: InputDocumentGroup, marked: Marked) {
  const eta = new Eta({ views: rootConfig.themeRootPath, varName: "data", debug: true });

  inputDocumentGroup.documents.forEach((d) =>
    renderDocument(rootConfig, inputDocumentGroup.documentGroupConfig, d, marked, eta),
  );
}

export function renderSite(rootConfig: RootConfig, inputDocumentGroups: InputDocumentGroup[]) {
  const marked = new Marked({ pedantic: false });

  inputDocumentGroups.forEach((g) => renderDocumentGroup(rootConfig, g, marked));
}
