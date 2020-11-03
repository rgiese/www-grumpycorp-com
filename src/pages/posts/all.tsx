import { graphql } from "gatsby";
import React from "react";

import Layout from "../../components/layout";
import type { PostIndexPosts } from "../../components/postIndex";
import { PostIndex } from "../../components/postIndex";
import Seo from "../../components/seo";

// Automatic (exported) GraphQL query
export const postIndexAndTagsQuery = graphql`
  query {
    posts: allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fields: { sourceInstanceName: { eq: "posts" } } }
    ) {
      ...PostIndexPosts
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface PostIndexData {
  posts: PostIndexPosts;
}

const IndexPage: React.FunctionComponent<{
  data: PostIndexData;
}> = ({ data }) => {
  return (
    <Layout>
      <Seo title="All posts" />
      <PostIndex posts={data.posts} />
    </Layout>
  );
};

export default IndexPage;
