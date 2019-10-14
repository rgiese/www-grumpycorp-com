import { graphql } from "gatsby";
import React from "react";

import Layout from "../components/layout";
import { Post, PostContent } from "../components/post";
import { PostIndexPosts } from "../components/postIndex";
import SEO from "../components/seo";

// Page context to be provided from ../gatsby/createPages.ts
export interface PostPageContext {
  slug: string;
  sourceInstanceName: string;

  previousPostSlugs: string[];
  nextPostSlugs: string[];
}

// Page-level GraphQL query
export const postContentQuery = graphql`
  query(
    $slug: String!
    $previousPostSlugs: [String]
    $nextPostSlugs: [String]
  ) {
    post: mdx(fields: { slug: { eq: $slug } }) {
      ...PostContent
    }
    previousPosts: allMdx(
      filter: { fields: { slug: { in: $previousPostSlugs } } }
    ) {
      ...PostIndexPosts
    }
    nextPosts: allMdx(filter: { fields: { slug: { in: $nextPostSlugs } } }) {
      ...PostIndexPosts
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface PostContentData {
  post: PostContent;
  previousPosts: PostIndexPosts;
  nextPosts: PostIndexPosts;
}

// Component definition
const PostPage: React.FunctionComponent<{
  data: PostContentData;
  pageContext: PostPageContext; // used in GraphQL query
}> = ({ data }) => {
  const post = data.post;

  return (
    <Layout>
      <SEO title={post.frontmatter.title} />

      <Post
        post={post}
        previousPosts={data.previousPosts}
        nextPosts={data.nextPosts}
      />
    </Layout>
  );
};

export default PostPage;
