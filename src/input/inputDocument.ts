import * as yup from "yup";

import { FileSpec } from "../fileSystem";

export const FrontMatterSchema = yup.object({
  title: yup.string().required(),
  published: yup.date(),
  keywords: yup.array().of(yup.string()),
});

export type InputFrontmatter = yup.InferType<typeof FrontMatterSchema>;

export type InputDocument = {
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
};

export type InputDocumentInventory = Map<string /* documentGroupName */, InputDocument[]>;
