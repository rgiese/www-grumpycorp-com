import * as yup from "yup";

import { SourceFile } from "../fileSystem";

export const FrontMatterSchema = yup.object({
  title: yup.string().required(),
  published: yup.date(),
  keywords: yup.array().of(yup.string()),
});

export type InputFrontmatter = yup.InferType<typeof FrontMatterSchema>;

export type InputDocument = {
  sourceFile: SourceFile;
  documentGroupRelativePath: string;
  frontMatter: InputFrontmatter;
  content: string;
};
