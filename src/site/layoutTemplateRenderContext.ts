import { InputDocumentInventory } from "../input";

import { getDocumentTagSet } from "./documentTag";

export const generateLayoutTemplateRenderContext = (inputDocumentInventory: InputDocumentInventory): object => {
  return {
    postTags: getDocumentTagSet(inputDocumentInventory.get("posts") || []),
  };
};
