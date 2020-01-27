import { PostIndex, PostIndexPosts } from "../components/postIndex";

import Layout from "../components/layout";
import React from "react";
import Seo from "../components/seo";
import { graphql } from "gatsby";

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
      <Seo title={tag} />
      <PostIndex posts={data.posts} />
    </Layout>
  );
};

export default TagIndexPage;
