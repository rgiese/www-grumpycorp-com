import { GeneratedDocumentsGenerator, TemplateType } from "../config";

import { getDocumentTag, getDocumentTagSet } from "./documentTag";
import { generateLayoutTemplateRenderContext } from "./layoutTemplateRenderContext";

export const postIndexPagesGenerator: GeneratedDocumentsGenerator = (inputDocumentInventory) => {
  // All index documents share the same layout template
  const generatedDocumentBase = {
    templateName: "_layout.eta",
    // We're relying on `generateLayoutTemplateRenderContext` not specializing on any given input document
    templateRenderContext: generateLayoutTemplateRenderContext(inputDocumentInventory),
  };

  // Find all posts and their tags
  const postDocuments = inputDocumentInventory.get("posts") || [];
  const postTags = getDocumentTagSet(postDocuments);

  return [
    // Index of all posts
    {
      siteRelativeOutputPath: "posts/all/index.html",
      frontMatter: {
        title: "All",
      },
      contentTemplateType: TemplateType.Eta,
      contentTemplateName: "_post_index.eta",
      contentTemplateContext: {
        postDocuments: [...postDocuments]
          // Show newest first (copy it with the ^spread we don't change the original array)
          // - `.published` is guaranteed from input validation
          .sort((lhs, rhs) => +rhs.frontMatter.published! - +lhs.frontMatter.published!)
          .map((d) => {
            return { ...d, documentTag: getDocumentTag(d) };
          }),
      },
      ...generatedDocumentBase,
    },
    // Index per tag
    ...postTags.map((tag) => {
      return {
        siteRelativeOutputPath: `tags/posts/${tag}/index.html`,
        frontMatter: {
          title: tag,
        },
        contentTemplateType: TemplateType.Eta,
        contentTemplateName: "_post_index.eta",
        contentTemplateContext: {
          postDocuments: postDocuments
            // Show oldest first, i.e. in existing sort order
            .map((d) => {
              return { ...d, documentTag: getDocumentTag(d) };
            })
            .filter((d) => d.documentTag === tag),
        },
        ...generatedDocumentBase,
      };
    }),
  ];
};
