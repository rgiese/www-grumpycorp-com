import * as path from "path";

import { InputDocument } from "../input";

export function getDocumentTag(inputDocument: InputDocument) {
  return path.dirname(inputDocument.documentGroupRelativePath);
}
