import { InputDocumentInventory } from "../types";

import { getDocumentTagSet } from "./documentTag";

export const generateLayoutTemplateRenderContext = (inputDocumentInventory: InputDocumentInventory): object => {
  return {
    postTags: getDocumentTagSet(inputDocumentInventory.get("posts") || []),
  };
};
