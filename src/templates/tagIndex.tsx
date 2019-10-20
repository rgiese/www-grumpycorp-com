import { graphql } from "gatsby";
import React from "react";

import Layout from "../components/layout";
import { PostIndexPosts, PostIndex } from "../components/postIndex";
import SEO from "../components/seo";

// Page context to be provided from ../gatsby/createPages.ts
export interface TagIndexPageContext {
  sourceInstanceName: string;
  tag: string;
}

// Automatic (exported) GraphQL query
export const tagIndexQuery = graphql`
  query($sourceInstanceName: String, $tag: String) {
    posts: allMdx(
      sort: { fields: [frontmatter___date], order: ASC }
      filter: {
        frontmatter: { tags: { in: [$tag] } }
        fields: { sourceInstanceName: { eq: $sourceInstanceName } }
      }
    ) {
      ...PostIndexPosts
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface TagIndexData {
  posts: PostIndexPosts;
}

// Component definition
const TagIndexPage: React.FunctionComponent<{
  pageContext: TagIndexPageContext;
  data: TagIndexData;
}> = ({ pageContext, data }) => {
  const tag = pageContext.tag;

  return (
    <Layout>
      <SEO title={tag} />
      <PostIndex posts={data.posts} />
    </Layout>
  );
};

export default TagIndexPage;
