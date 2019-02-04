import { graphql } from "gatsby";
import React from "react";

import Layout from "../components/layout";
import { IPostIndexPosts, PostIndex } from "../components/postIndex";
import SEO from "../components/seo";

export interface ITagIndexPageContext {
  sourceInstanceName: string;
  tag: string;
}

// Automatic (exported) GraphQL query
export const tagIndexQuery = graphql`
  query($tag: String) {
    posts: allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      ...PostIndexPosts
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface ITagIndexData {
  posts: IPostIndexPosts;
}

// Component definition
const IndexPage: React.SFC<{
  pageContext: ITagIndexPageContext;
  data: ITagIndexData;
}> = ({ pageContext, data }) => {
  const tag = pageContext.tag;

  return (
    <Layout>
      <SEO title={tag} />
      <h1>{tag}</h1>
      <PostIndex posts={data.posts} />
    </Layout>
  );
};

export default IndexPage;
