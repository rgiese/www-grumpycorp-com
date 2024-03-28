import * as path from "path";

import { InputDocument } from "../input";

export function getDocumentTag(inputDocument: InputDocument) {
  return path.dirname(inputDocument.documentGroupRelativePath);
}

export function getDocumentTagSet(inputDocuments: InputDocument[]) {
  return Array.from(new Set(inputDocuments.map((d) => getDocumentTag(d)))).sort();
}
