import { PostIndex, PostIndexPosts } from "../../components/postIndex";

import Layout from "../../components/layout";
import React from "react";
import Seo from "../../components/seo";
import { graphql } from "gatsby";

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
