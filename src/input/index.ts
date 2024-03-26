import * as matter from "gray-matter";
import * as path from "path";
import * as yup from "yup";

import { RootConfig, DocumentGroupConfig } from "../config";

import { SourceFile, SourceFileSystem } from "../fileSystem";

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

export type InputDocumentGroup = {
  documentGroupConfig: DocumentGroupConfig;
  documents: InputDocument[];
};

export type InputDocumentInventory = Map<string /* documentGroupName */, InputDocumentGroup>;

function ingestInputDocument(documentGroupConfig: DocumentGroupConfig, sourceFile: SourceFile): InputDocument {
  try {
    const document = matter.read(sourceFile.absolutePath);
    const frontMatter = FrontMatterSchema.validateSync(document.data, { stripUnknown: true });

    if (documentGroupConfig.requirePublishDate && !frontMatter.published) {
      throw new Error(
        `No "published" value in frontmatter ${JSON.stringify(frontMatter)} (required by containing document group)`,
      );
    }

    return {
      // Source
      sourceFile,
      // Grouping
      documentGroupConfig,
      documentGroupRelativePath: path.relative(documentGroupConfig.inputRootRelativePath, sourceFile.rootRelativePath),
      // Destination
      siteRelativeOutputPath: "", // computed after ingestion
      // Content
      frontMatter,
      content: document.content,
    };
  } catch (error) {
    console.error(`While processing ${sourceFile.absolutePath}:`);
    throw error;
  }
}

function ingestDocumentGroup(
  sourceFileSystem: SourceFileSystem,
  documentGroupConfig: DocumentGroupConfig,
): InputDocumentGroup {
  const inputDocumentPaths = sourceFileSystem.inputFiles
    .filter((f) => f.rootRelativePath.startsWith(documentGroupConfig.inputRootRelativePath))
    .filter((f) => f.parsedRootRelativePath.ext === ".md");

  const documents = inputDocumentPaths
    .map((f) => ingestInputDocument(documentGroupConfig, f))
    .map((d) => {
      return { ...d, siteRelativeOutputPath: documentGroupConfig.outputPathFromDocumentPath(d) };
    });

  return {
    documentGroupConfig: documentGroupConfig,
    documents: documentGroupConfig.requirePublishDate
      ? documents.sort((lhs, rhs) => +lhs.frontMatter.published - +rhs.frontMatter.published)
      : documents,
  };
}

export function ingestInput(rootConfig: RootConfig, sourceFileSystem: SourceFileSystem): InputDocumentInventory {
  return new Map(
    rootConfig.documentGroups
      .map((g) => ingestDocumentGroup(sourceFileSystem, g))
      .map((dg) => [dg.documentGroupConfig.documentGroupName, dg] as const),
  );
}
