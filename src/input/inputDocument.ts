import * as yup from "yup";

export const FrontMatterSchema = yup.object({
  title: yup.string().required(),
  published: yup.date(),
});

export type InputFrontmatter = yup.InferType<typeof FrontMatterSchema>;

export type InputDocument = {
  relativePath: string;
  frontMatter: InputFrontmatter;
  content: string;
};
