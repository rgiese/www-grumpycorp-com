import { Buffer } from "node:buffer";
import * as fs from "fs";
import { Eta } from "eta";
import hljs from "highlight.js";
import { Marked } from "marked";
import { createDirectives } from "marked-directive";
import { markedHighlight } from "marked-highlight";
import minifyHtml from "@minify-html/node";

import { DocumentGroupConfig, GeneratedDocument, RootConfig } from "../config";
import { InputDocument, InputDocumentInventory } from "../input";
import { OutputFileSystem } from "../fileSystem";

export class SiteRenderer {
  private readonly marked: Marked;
  private readonly eta: Eta;

  constructor(
    private readonly rootConfig: RootConfig,
    private readonly inputDocumentInventory: InputDocumentInventory,
    private readonly outputFileSystem: OutputFileSystem,
    private readonly minifyOutput: boolean,
  ) {
    this.marked = new Marked(
      { pedantic: false },
      markedHighlight({
        langPrefix: "hljs language-",
        highlight(code, lang, _info) {
          const language = hljs.getLanguage(lang) ? lang : "plaintext";
          return hljs.highlight(code, { language }).value;
        },
      }),
    ).use(createDirectives(rootConfig.customDirectives));
    this.eta = new Eta({ views: rootConfig.themeRootPath, varName: "data", debug: true });
  }

  public render() {
    // Static documents
    this.rootConfig.documentGroups.forEach((g) =>
      this.inputDocumentInventory.get(g.documentGroupName)?.forEach((d) => this.renderDocument(g, d)),
    );

    // Generated documents
    this.rootConfig.generatedDocuments?.(this.inputDocumentInventory).forEach((d) => this.renderGeneratedDocument(d));
  }

  private renderDocument(documentGroupConfig: DocumentGroupConfig, inputDocument: InputDocument) {
    const outputPath = this.outputFileSystem.getAbsolutePath(inputDocument.siteRelativeOutputPath);
    this.outputFileSystem.ensureOutputPathExists(outputPath);

    console.log(
      `${inputDocument.documentGroupRelativePath} -> ${inputDocument.siteRelativeOutputPath} -> ${outputPath}`,
    );

    try {
      // Render content from Markdown
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

      // Minify
      const outputHtml = this.minifyOutput
        ? minifyHtml.minify(Buffer.from(pageHtml), { keep_spaces_between_attributes: true })
        : pageHtml;

      // Output
      fs.writeFileSync(outputPath, outputHtml);
    } catch (error) {
      console.error(`While creating ${outputPath} from ${inputDocument.documentGroupRelativePath}:`);
      console.error(`with frontmatter: ${JSON.stringify(inputDocument.frontMatter)}`);
      throw error;
    }
  }

  private renderGeneratedDocument(generatedDocument: GeneratedDocument) {
    const outputPath = this.outputFileSystem.getAbsolutePath(generatedDocument.siteRelativeOutputPath);
    this.outputFileSystem.ensureOutputPathExists(outputPath);

    console.log(`${generatedDocument.siteRelativeOutputPath} -> ${outputPath}`);

    try {
      // Render content from Eta template and context
      const contentHtml = this.eta.render(generatedDocument.contentTemplateName, {
        // Site-provided context (bring this in first so it can't override "official" fields)
        ...generatedDocument.contentTemplateContext,
        // Inventory
        inputDocumentInventory: this.inputDocumentInventory,
      });

      // Render template
      const pageHtml = this.eta.render(generatedDocument.templateName, {
        // Site-provided context (bring this in first so it can't override "official" fields)
        ...generatedDocument.templateRenderContext,
        // This document
        inputDocument: {
          frontMatter: generatedDocument.frontMatter,
        },
        contentHtml,
        // Inventory
        inputDocumentInventory: this.inputDocumentInventory,
      });

      // Output
      fs.writeFileSync(outputPath, pageHtml);
    } catch (error) {
      console.error(`While creating ${outputPath} from ${generatedDocument.siteRelativeOutputPath}:`);
      console.error(`with frontmatter: ${JSON.stringify(generatedDocument.frontMatter)}`);
      throw error;
    }
  }
}
