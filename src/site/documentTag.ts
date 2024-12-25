import * as path from "path";

import { InputDocument } from "../types";

export function getDocumentTag(inputDocument: InputDocument) {
  return path.dirname(inputDocument.documentGroupRelativePath);
}

export function getDocumentTagSet(inputDocuments: InputDocument[]) {
  return Array.from(new Set(inputDocuments.map((d) => getDocumentTag(d)))).sort();
}

export function tagPresenter(tag: string) {
  return tag.replaceAll("-", '<span class="tag-dash">-</span>');
}
