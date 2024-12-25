import { InputDocumentInventory } from "../types";

import { getDocumentTagSet, tagPresenter } from "./documentTag";

export const generateLayoutTemplateRenderContext = (inputDocumentInventory: InputDocumentInventory): object => {
  return {
    postTags: getDocumentTagSet(inputDocumentInventory.get("posts") || []),
    tagPresenter,
  };
};
