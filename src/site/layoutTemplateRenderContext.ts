import { RenderContextGenerator } from "../config";

import { getDocumentTagSet } from "./documentTag";

export const generateLayoutTemplateRenderContext: RenderContextGenerator = (_inputDocument, inputDocumentInventory) => {
  return {
    postTags: getDocumentTagSet(inputDocumentInventory.get("posts")),
  };
};
