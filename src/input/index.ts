import * as matter from "gray-matter";
import * as path from "path";

import { RootConfig, DocumentGroupConfig } from "../config";

import { InputDocument, InputDocumentInventory, FrontMatterSchema } from "./inputDocument";
import { SourceFile, SourceFileSystem } from "../fileSystem";

export { InputDocument, InputDocumentInventory };

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
      documentGroupName: documentGroupConfig.documentGroupName,
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
): InputDocument[] {
  const inputDocumentPaths = sourceFileSystem.inputFiles
    .filter((f) => f.rootRelativePath.startsWith(documentGroupConfig.inputRootRelativePath))
    .filter((f) => f.parsedRootRelativePath.ext === ".md");

  const documents = inputDocumentPaths
    .map((f) => ingestInputDocument(documentGroupConfig, f))
    .map((d) => {
      return { ...d, siteRelativeOutputPath: documentGroupConfig.outputPathFromDocumentPath(d) };
    });

  return documentGroupConfig.requirePublishDate
    ? documents.sort((lhs, rhs) => +lhs.frontMatter.published - +rhs.frontMatter.published)
    : documents;
}

export function ingestInput(rootConfig: RootConfig, sourceFileSystem: SourceFileSystem): InputDocumentInventory {
  return new Map(rootConfig.documentGroups.map((g) => [g.documentGroupName, ingestDocumentGroup(sourceFileSystem, g)]));
}
