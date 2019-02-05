import { graphql } from "gatsby";
import React from "react";

import Layout from "../components/layout";
import { IPostIndexPosts, PostIndex } from "../components/postIndex";
import SEO from "../components/seo";
import { ITagIndexTags, TagIndex } from "../components/tagIndex";

// Page context to be provided from ../gatsby/createPages.ts
export interface ITagIndexPageContext {
  sourceInstanceName: string;
  tag: string;
}

// Automatic (exported) GraphQL query
export const tagIndexQuery = graphql`
  query($sourceInstanceName: String, $tag: String) {
    posts: allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      ...PostIndexPosts
    }
    tagIndex: allMdx(
      filter: { fields: { sourceInstanceName: { eq: $sourceInstanceName } } }
    ) {
      ...TagIndexTags
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface ITagIndexData {
  posts: IPostIndexPosts;
  tagIndex: ITagIndexTags;
}

// Component definition
const TagIndexPage: React.FunctionComponent<{
  pageContext: ITagIndexPageContext;
  data: ITagIndexData;
}> = ({ pageContext, data }) => {
  const tag = pageContext.tag;

  return (
    <Layout>
      <SEO title={tag} />
      <h1>{tag}</h1>
      <PostIndex posts={data.posts} />
      <h2>All tags</h2>
      <TagIndex
        sourceInstanceName={pageContext.sourceInstanceName}
        tags={data.tagIndex}
      />
    </Layout>
  );
};

export default TagIndexPage;
