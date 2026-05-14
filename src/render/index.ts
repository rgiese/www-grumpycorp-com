import fs from "node:fs";
import { Eta } from "eta";
import hljs from "highlight.js";
import { Marked } from "marked";
import { createDirectives } from "marked-directive";
import { markedHighlight } from "marked-highlight";
import htmlMinifier from "html-minifier-terser";
import path from "node:path";

import { ImageManager } from "../assets";
import { DocumentGroupConfig, RootConfig } from "../config";
import { createFigureDirective } from "./figureDirective";
import { minifyOptions } from "./minifyOptions";
import { GeneratedDocument, TemplateType, InputDocument, InputDocumentInventory } from "../types";
import { getFileSystemStat, OutputFileSystem, siteBuildId } from "../fileSystem";
import { enumerateFilesRecursive } from "../fileSystem/enumerateFiles";

export class SiteRenderer {
  private readonly eta: Eta;
  private readonly newestThemeFileMtimeMs: number;
  private readonly baseRenderContext = { siteBuildId };

  constructor(
    private readonly rootConfig: RootConfig,
    private readonly inputDocumentInventory: InputDocumentInventory,
    private readonly imageManager: ImageManager,
    private readonly outputFileSystem: OutputFileSystem,
    private readonly minifyOutput: boolean,
  ) {
    this.eta = new Eta({ views: rootConfig.themeRootPath, varName: "data", debug: true });

    this.newestThemeFileMtimeMs = Math.max(
      ...Array.from(enumerateFilesRecursive(rootConfig.themeRootPath, rootConfig.themeRootPath)).map(
        (f) => getFileSystemStat(f.absolutePath, { requireExists: true }).mtimeMs,
      ),
    );
  }

  public async render(): Promise<boolean /* didRegenerate */> {
    // Static documents
    const staticResults = await Promise.all(
      this.rootConfig.documentGroups.flatMap(
        (g) => this.inputDocumentInventory.get(g.documentGroupName)?.map((d) => this.renderDocument(g, d)) ?? [],
      ),
    );

    // Generated documents
    const newestInputDocumentModifiedTimeMs = Math.max(
      ...Array.from(this.inputDocumentInventory).flatMap(([_documentGroupName, inputDocuments]) =>
        inputDocuments.map(
          (inputDocument) => getFileSystemStat(inputDocument.sourceFile.absolutePath, { requireExists: true }).mtimeMs,
        ),
      ),
    );

    const generatedResults = await Promise.all(
      this.rootConfig
        .generatedDocuments?.(this.inputDocumentInventory)
        .map((d) => this.renderGeneratedDocument(newestInputDocumentModifiedTimeMs, d)) ?? [],
    );

    return [...staticResults, ...generatedResults].some(Boolean);
  }

  private async renderDocument(
    documentGroupConfig: DocumentGroupConfig,
    inputDocument: InputDocument,
  ): Promise<boolean /* didRegenerate */> {
    // Set up paths
    const sourceFileStat = getFileSystemStat(inputDocument.sourceFile.absolutePath, { requireExists: true });

    const outputPath = this.outputFileSystem.getAbsolutePath(inputDocument.siteRelativeOutputPath);
    const outputFileStat = getFileSystemStat(outputPath, { requireExists: false });

    if (outputFileStat && Math.max(sourceFileStat.mtimeMs, this.newestThemeFileMtimeMs) < outputFileStat.mtimeMs) {
      return false;
    }

    this.outputFileSystem.ensureOutputPathExists(outputPath);

    // Process content
    console.log(
      `${inputDocument.documentGroupRelativePath} -> ${inputDocument.siteRelativeOutputPath} -> ${outputPath}`,
    );

    try {
      // Render content from Markdown
      const contentHtml = this.renderMarkdown(inputDocument.sourceFile.rootRelativePath, inputDocument.content);

      // Render template
      const templateRenderContext = documentGroupConfig.templateRenderContext?.(
        inputDocument,
        this.inputDocumentInventory,
      );

      const pageHtml = this.eta.render(documentGroupConfig.templateName, {
        // Site-provided context (bring this in first so it can't override "official" fields)
        ...templateRenderContext,
        // Base context
        ...this.baseRenderContext,
        // This document
        inputDocument,
        contentHtml,
        // Inventory
        inputDocumentInventory: this.inputDocumentInventory,
      });

      // Output
      await this.writeOutputHtml(outputPath, pageHtml);
    } catch (error) {
      console.error(`While creating ${outputPath} from ${inputDocument.documentGroupRelativePath}:`);
      console.error(`with frontmatter: ${JSON.stringify(inputDocument.frontMatter)}`);
      throw error;
    }

    return true;
  }

  private renderContentTemplate(generatedDocument: GeneratedDocument): string {
    switch (generatedDocument.contentTemplateType) {
      case TemplateType.Eta:
        // Load Eta template from `templates` directory
        return this.eta.render(generatedDocument.contentTemplateName, {
          // Site-provided context (bring this in first so it can't override "official" fields)
          ...generatedDocument.contentTemplateContext,
          // Base context
          ...this.baseRenderContext,
          // Inventory
          inputDocumentInventory: this.inputDocumentInventory,
        });

      case TemplateType.Marked:
        // Load Marked template from `input` directory
        return this.renderMarkdown(
          generatedDocument.contentTemplateName,
          fs.readFileSync(path.join(this.rootConfig.inputRootPath, generatedDocument.contentTemplateName), "utf8"),
        );

      default:
        throw new Error(`Unsupported template type for ${generatedDocument.siteRelativeOutputPath}`);
    }
  }

  private async renderGeneratedDocument(
    newestInputDocumentModifiedTimeMs: number,
    generatedDocument: GeneratedDocument,
  ): Promise<boolean> {
    // Set up paths
    const outputPath = this.outputFileSystem.getAbsolutePath(generatedDocument.siteRelativeOutputPath);

    const outputFileStat = getFileSystemStat(outputPath, { requireExists: false });

    const contentTemplateMtimeMs =
      generatedDocument.contentTemplateType === TemplateType.Marked
        ? getFileSystemStat(path.join(this.rootConfig.inputRootPath, generatedDocument.contentTemplateName), {
            requireExists: true,
          }).mtimeMs
        : 0;

    if (
      outputFileStat &&
      Math.max(newestInputDocumentModifiedTimeMs, this.newestThemeFileMtimeMs, contentTemplateMtimeMs) <
        outputFileStat.mtimeMs
    ) {
      return false;
    }

    this.outputFileSystem.ensureOutputPathExists(outputPath);

    // Process content
    console.log(`${generatedDocument.siteRelativeOutputPath} -> ${outputPath}`);

    try {
      // Render content from template and context
      const contentHtml = this.renderContentTemplate(generatedDocument);

      // Render template
      const pageHtml = this.eta.render(generatedDocument.templateName, {
        // Site-provided context (bring this in first so it can't override "official" fields)
        ...generatedDocument.templateRenderContext,
        // Base context
        ...this.baseRenderContext,
        // This document
        inputDocument: { frontMatter: generatedDocument.frontMatter },
        contentHtml,
        // Inventory
        inputDocumentInventory: this.inputDocumentInventory,
      });

      // Output
      await this.writeOutputHtml(outputPath, pageHtml);
    } catch (error) {
      console.error(`While creating ${outputPath} from ${generatedDocument.siteRelativeOutputPath}:`);
      console.error(`with frontmatter: ${JSON.stringify(generatedDocument.frontMatter)}`);
      throw error;
    }

    return true;
  }

  private renderMarkdown(siteRelativeInputPath: string, md: string): string {
    const figureDirective = createFigureDirective(
      this.imageManager,
      this.rootConfig.defaultImageSizes,
      siteRelativeInputPath,
    );

    const marked = new Marked({ pedantic: false })
      .use(
        markedHighlight({
          langPrefix: "hljs language-",
          highlight(code, lang, _info) {
            if (lang === "html") {
              return code; // preserve raw text so our renderer can pass it through as-is
            }
            const language = hljs.getLanguage(lang) ? lang : "plaintext";
            return hljs.highlight(code, { language }).value;
          },
        }),
      )
      .use({
        renderer: {
          // Pass ```html blocks through as raw HTML rather than syntax-highlighting and escaping them
          // This allows `prettier` to auto-format HTML for us inside Markdown files
          code({ text, lang }: { text: string; lang?: string }): string | false {
            if (lang === "html") {
              return text;
            }
            return false;
          },
        },
      })
      .use(createDirectives([figureDirective, ...this.rootConfig.customDirectives]));

    return marked.parse(md) as string;
  }

  private async writeOutputHtml(outputPath: string, pageHtml: string) {
    // Minify
    const outputHtml = this.minifyOutput ? await htmlMinifier.minify(pageHtml, minifyOptions) : pageHtml;

    // Output
    await fs.promises.writeFile(outputPath, outputHtml);
  }
}
