import * as yup from "yup";

import { DocumentGroupConfig } from "../config";
import { SourceFile } from "../fileSystem";

export const FrontMatterSchema = yup.object({
  title: yup.string().required(),
  published: yup.date(),
  keywords: yup.array().of(yup.string()),
});

export type InputFrontmatter = yup.InferType<typeof FrontMatterSchema>;

export type InputDocument = {
  // Source
  sourceFile: SourceFile;
  // Grouping
  documentGroupConfig: DocumentGroupConfig;
  documentGroupRelativePath: string;
  // Destination
  siteRelativeOutputPath: string;
  // Content
  frontMatter: InputFrontmatter;
  content: string;
};
