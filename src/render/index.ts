import * as fs from "fs";
import { Eta } from "eta";
import { Marked } from "marked";

import { DocumentGroupConfig, RootConfig } from "../config";
import { InputDocument, InputDocumentInventory } from "../input";
import { OutputFileSystem } from "../fileSystem";

export class SiteRenderer {
  private readonly marked = new Marked({ pedantic: false });
  private readonly eta: Eta;

  constructor(
    private readonly rootConfig: RootConfig,
    private readonly inputDocumentInventory: InputDocumentInventory,
    private readonly outputFileSystem: OutputFileSystem,
  ) {
    this.eta = new Eta({ views: rootConfig.themeRootPath, varName: "data", debug: true });
  }

  public render() {
    this.rootConfig.documentGroups.forEach((g) => {
      this.inputDocumentInventory.get(g.documentGroupName)?.forEach((d) => this.renderDocument(g, d));
    });
  }

  private renderDocument(documentGroupConfig: DocumentGroupConfig, inputDocument: InputDocument) {
    const outputPath = this.outputFileSystem.getAbsolutePath(inputDocument.siteRelativeOutputPath);
    this.outputFileSystem.ensureOutputPathExists(outputPath);

    console.log(
      `${inputDocument.documentGroupRelativePath} -> ${inputDocument.siteRelativeOutputPath} -> ${outputPath}`,
    );

    try {
      // Render content
      const contentHtml = this.marked.parse(inputDocument.content) as string;

      // Render template
      const templateRenderContext = documentGroupConfig.templateRenderContext?.(
        inputDocument,
        this.inputDocumentInventory,
      );

      const pageHtml = this.eta.render(documentGroupConfig.templateName, {
        // Site-provided context (bring this in first so it can't override "official" fields)
        ...templateRenderContext,
        // This document
        inputDocument,
        contentHtml,
        // Inventory
        inputDocumentInventory: this.inputDocumentInventory,
      });

      // Output
      fs.writeFileSync(outputPath, pageHtml);
    } catch (error) {
      console.error(`While creating ${outputPath} from ${inputDocument.documentGroupRelativePath}:`);
      console.error(`with frontmatter: ${JSON.stringify(inputDocument.frontMatter)}`);
      throw error;
    }
  }
}
