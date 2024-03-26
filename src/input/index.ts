import * as matter from "gray-matter";
import * as path from "path";

import { RootConfig, DocumentGroupConfig } from "../config";

import { InputDocument, FrontMatterSchema } from "./inputDocument";
import { SourceFile, SourceFileSystem } from "../fileSystem";

export { InputDocument };

export type InputDocumentGroup = {
  documentGroupConfig: DocumentGroupConfig;
  documents: InputDocument[];
};

function ingestInputDocument(documentGroupConfig: DocumentGroupConfig, sourceFile: SourceFile): InputDocument {
  try {
    const document = matter.read(sourceFile.absolutePath);

    return {
      // Source
      sourceFile,
      // Grouping
      documentGroupConfig,
      documentGroupRelativePath: path.relative(documentGroupConfig.inputRootRelativePath, sourceFile.rootRelativePath),
      // Destination
      siteRelativeOutputPath: "", // computed after ingestion
      // Content
      frontMatter: FrontMatterSchema.validateSync(document.data, { stripUnknown: true }),
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

  return {
    documentGroupConfig: documentGroupConfig,
    documents: inputDocumentPaths
      .map((f) => ingestInputDocument(documentGroupConfig, f))
      .map((d) => {
        return { ...d, siteRelativeOutputPath: documentGroupConfig.outputPathFromDocumentPath(d) };
      })
      .sort(
        (lhs, rhs) =>
          (lhs.frontMatter.published ? +lhs.frontMatter.published : 0) -
          (rhs.frontMatter.published ? +rhs.frontMatter.published : 0),
      ),
  };
}

export function ingestInput(rootConfig: RootConfig, sourceFileSystem: SourceFileSystem): InputDocumentGroup[] {
  return rootConfig.documentGroups.map((g) => ingestDocumentGroup(sourceFileSystem, g));
}
