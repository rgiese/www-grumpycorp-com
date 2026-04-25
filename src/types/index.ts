import * as path from "path";
import * as yup from "yup";

//
// Basics
//

export interface FileSpec {
  rootRelativePath: string;
  parsedRootRelativePath: path.ParsedPath;
  absolutePath: string;
}

//
// Input
//

export const FrontMatterSchema = yup.object({
  title: yup.string().required(),
  published: yup.date(),
  keywords: yup.array().of(yup.string()),
});

export type InputFrontmatter = yup.InferType<typeof FrontMatterSchema>;

export interface InputDocument {
  // Source
  sourceFile: FileSpec;
  // Grouping
  documentGroupName: string;
  documentGroupRelativePath: string;
  // Destination
  siteRelativeOutputPath: string;
  // Content
  frontMatter: InputFrontmatter;
  content: string;
}

export type InputDocumentInventory = Map<string /* documentGroupName */, InputDocument[]>;

//
// Render
//

export type RenderContextGenerator = (
  inputDocument: InputDocument,
  inputDocumentInventory: InputDocumentInventory,
) => object;

export enum TemplateType {
  Eta,
  Marked,
}

export interface GeneratedDocument {
  // Destination
  siteRelativeOutputPath: string;
  // Content
  frontMatter: {
    title: string;
  };
  contentTemplateType: TemplateType;
  contentTemplateName: string;
  contentTemplateContext: object;
  // Render
  templateName: string;
  templateRenderContext: object;
}

export type GeneratedDocumentsGenerator = (inputDocumentInventory: InputDocumentInventory) => GeneratedDocument[];
