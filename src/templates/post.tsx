import { graphql } from "gatsby";
// tslint:disable-next-line no-submodule-imports
import MDXRenderer from "gatsby-mdx/mdx-renderer";
import React from "react";

import Layout from "../components/layout";
import SEO from "../components/seo";

// Page context to be provided from ../gatsby/createPages.ts
export interface IPostPageContext {
  slug: string;
  sourceInstanceName: string;
}

// Page-level GraphQL query
export const pageContentQuery = graphql`
  query($slug: String!) {
    post: mdx(fields: { slug: { eq: $slug } }) {
      code {
        body
      }
      frontmatter {
        title
        date
      }
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface IPageContentData {
  post: {
    code: {
      body: string;
    };
    frontmatter: {
      title: string;
      date: string;
    };
  };
}

// Component definition
const IndexPage: React.SFC<{
  data: IPageContentData;
  pageContext: IPostPageContext;
}> = ({ data }) => {
  const post = data.post;

  return (
    <Layout>
      <SEO title={post.frontmatter.title} />
      <h1>{post.frontmatter.title}</h1>
      <MDXRenderer>{post.code.body}</MDXRenderer>
    </Layout>
  );
};

export default IndexPage;
