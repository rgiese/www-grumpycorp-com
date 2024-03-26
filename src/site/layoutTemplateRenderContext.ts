import { RenderContextGenerator } from "../config";

import { getDocumentTag } from "./documentTag";

export const generateLayoutTemplateRenderContext: RenderContextGenerator = (inputDocument, inputDocumentInventory) => {
  return {
    postTags: Array.from(new Set(inputDocumentInventory.get("posts").map((d) => getDocumentTag(d)))).sort(),
  };
};
