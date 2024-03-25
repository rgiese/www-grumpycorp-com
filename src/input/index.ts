import * as matter from "gray-matter";
import * as path from "path";

import { RootConfig, DocumentGroupConfig } from "../config";

import { InputDocument, FrontMatterSchema } from "./inputDocument";
import { enumerateFilesRecursive } from "../tools";

export { InputDocument };

export type InputDocumentGroup = {
  documentGroupConfig: DocumentGroupConfig;
  documents: InputDocument[];
};

function ingestInputDocument(documentGroupInputRoot: string, documentPath: string): InputDocument {
  try {
    const documentRelativePath = path.relative(documentGroupInputRoot, documentPath);
    const document = matter.read(documentPath);

    return {
      relativePath: documentRelativePath,
      frontMatter: FrontMatterSchema.validateSync(document.data, { stripUnknown: true }),
      content: document.content,
    };
  } catch (error) {
    console.error(`While processing ${documentPath}:`);
    throw error;
  }
}

function ingestDocumentGroup(rootConfig: RootConfig, documentGroupConfig: DocumentGroupConfig): InputDocumentGroup {
  const documentGroupInputRoot = path.resolve(rootConfig.inputRootPath, documentGroupConfig.inputRelativePath);

  const inputDocumentPaths = Array.from(enumerateFilesRecursive(documentGroupInputRoot, ".md"));

  return {
    documentGroupConfig: documentGroupConfig,
    documents: inputDocumentPaths.map((x) => ingestInputDocument(documentGroupInputRoot, x)),
  };
}

export function ingestInput(rootConfig: RootConfig): InputDocumentGroup[] {
  return rootConfig.documentGroups.map((g) => ingestDocumentGroup(rootConfig, g));
}
