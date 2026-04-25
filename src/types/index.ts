import * as path from "path";
import * as yup from "yup";

export { PlainDate, comparePlainDates, plainDateFrom } from "./temporal";
import { PlainDate, plainDateFrom } from "./temporal";

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
  published: yup.mixed<PlainDate>().transform((value: unknown) => {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return plainDateFrom({ year: value.getUTCFullYear(), month: value.getUTCMonth() + 1, day: value.getUTCDate() });
    }

    if (typeof value === "string") {
      return plainDateFrom(value);
    }

    return value as PlainDate;
  }),
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
