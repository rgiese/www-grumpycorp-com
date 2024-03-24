import * as path from "path";
import { Eta } from "eta";

import { RootConfig, DocumentGroupConfig } from "../config";

import { InputDocument } from "./inputDocument";
import { enumerateFilesRecursive } from "./tools";

export { InputDocument };

export type InputDocumentGroup = {
  documentGroupConfig: DocumentGroupConfig;
  documents: InputDocument[];
};

function ingestInputDocument(documentGroupInputRoot: string, documentPath: string): InputDocument {
  // Configure paths
  const documentRelativePath = path.relative(documentGroupInputRoot, documentPath);

  // Configure document metadata
  let documentTitle = "";
  let documentDate = new Date(0);

  const setDocumentInfo = (title: string, date?: Date) => {
    documentTitle = title;

    if (date) {
      documentDate = date;
    }
  };

  // Ingest content
  const eta = new Eta({ views: documentGroupInputRoot, varName: "data" });

  try {
    const documentContent = eta.render(documentRelativePath, {
      setDocumentInfo,
    });

    if (!documentTitle) {
      throw new Error("No document title specified.");
    }

    // Commit
    return {
      documentRelativePath,
      documentTitle,
      documentDate,
      documentContent,
    };
  } catch (error) {
    console.error(`While processing ${documentPath}:`);
    throw error;
  }
}

function ingestDocumentGroup(rootConfig: RootConfig, documentGroupConfig: DocumentGroupConfig): InputDocumentGroup {
  const documentGroupInputRoot = path.resolve(rootConfig.inputRootPath, documentGroupConfig.inputRelativePath);

  const inputDocumentPaths = Array.from(enumerateFilesRecursive(documentGroupInputRoot, ".eta"));

  return {
    documentGroupConfig: documentGroupConfig,
    documents: inputDocumentPaths.map((x) => ingestInputDocument(documentGroupInputRoot, x)),
  };
}

export function ingestInput(rootConfig: RootConfig): InputDocumentGroup[] {
  return rootConfig.documentGroups.map((g) => ingestDocumentGroup(rootConfig, g));
}
