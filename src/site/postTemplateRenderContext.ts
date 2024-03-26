import * as path from "path";

import { RenderContextGenerator } from "../config";
import { InputDocument } from "../input";

const generateDocumentTag: RenderContextGenerator = (inputDocument, _inputDocumentInventory) => {
  return { documentTag: path.dirname(inputDocument.documentGroupRelativePath) };
};

const generatePreviousNext: RenderContextGenerator = (
  inputDocument,
  inputDocumentInventory,
): {
  previousDocument?: InputDocument;
  nextDocument?: InputDocument;
} => {
  const inputDocumentsInGroup = inputDocumentInventory.get(inputDocument.documentGroupName);

  const thisDocumentIndex = inputDocumentsInGroup.findIndex(
    (d) => d.sourceFile.rootRelativePath === inputDocument.sourceFile.rootRelativePath,
  );

  if (thisDocumentIndex < 0) {
    return { previousDocument: undefined, nextDocument: undefined };
  }

  return {
    previousDocument: thisDocumentIndex > 0 ? inputDocumentsInGroup[thisDocumentIndex - 1] : undefined,
    nextDocument:
      thisDocumentIndex + 1 < inputDocumentsInGroup.length ? inputDocumentsInGroup[thisDocumentIndex + 1] : undefined,
  };
};

export const generatePostTemplateRenderContext: RenderContextGenerator = (inputDocument, inputDocumentInventory) => {
  return {
    ...generateDocumentTag(inputDocument, inputDocumentInventory),
    ...generatePreviousNext(inputDocument, inputDocumentInventory),
  };
};
