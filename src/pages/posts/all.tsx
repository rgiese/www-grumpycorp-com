import { graphql } from "gatsby";
import React from "react";

import Layout from "../../components/layout";
import { PostIndex } from "../../components/postIndex";
import Seo from "../../components/seo";

// Automatic (exported) GraphQL query
export const postIndexAndTagsQuery = graphql`
  query {
    posts: allMdx(filter: { fields: { sourceInstanceName: { eq: "posts" } } }) {
      ...PostIndexPosts
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface PostIndexData {
  posts: Queries.PostIndexPostsFragment;
}

const IndexPage = ({ data }: { data: PostIndexData }): React.ReactNode => {
  // Sort posts in descending (most recent first) order
  const posts = [...data.posts.nodes].sort(
    (lhs, rhs) =>
      Date.parse(rhs?.frontmatter?.date || "") -
      Date.parse(lhs?.frontmatter?.date || "")
  );

  return (
    <Layout>
      <Seo title="All posts" />
      <PostIndex posts={posts} />
    </Layout>
  );
};

export default IndexPage;
