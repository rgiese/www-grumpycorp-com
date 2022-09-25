import { graphql } from "gatsby";
import React from "react";

import Layout from "../components/layout";
import { PostIndex } from "../components/postIndex";
import Seo from "../components/seo";

// Page context to be provided from ../gatsby/createPages.ts
export interface TagIndexPageContext {
  sourceInstanceName: string;
  tag: string;
}

// Automatic (exported) GraphQL query
export const tagIndexQuery = graphql`
  query ($sourceInstanceName: String, $tag: String) {
    posts: allMdx(
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
  posts: Queries.PostIndexPostsFragment;
}

// Component definition
const TagIndexPage: React.FunctionComponent<{
  pageContext: TagIndexPageContext;
  data: TagIndexData;
}> = ({ pageContext, data }) => {
  const tag = pageContext.tag;

  // Sort posts in assending (oldest first) order
  const posts = [...data.posts.nodes].sort(
    (lhs, rhs) =>
      Date.parse(lhs?.frontmatter?.date || "") -
      Date.parse(rhs?.frontmatter?.date || "")
  );

  return (
    <Layout>
      <Seo title={tag} />
      <PostIndex posts={posts} />
    </Layout>
  );
};

export default TagIndexPage;
