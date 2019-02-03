import { graphql } from "gatsby";
// tslint:disable-next-line no-submodule-imports
import MDXRenderer from "gatsby-mdx/mdx-renderer";
import React from "react";

import Layout from "../components/layout";
import SEO from "../components/seo";

// Page-level GraphQL query
export const query = graphql`
  query($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
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

// Component properties with TypeScript-typed fields corresponding to GraphQL query
interface IPostPropsWithData {
  data: {
    mdx: {
      code: {
        body: string;
      };
      frontmatter: {
        title: string;
        date: string;
      };
    };
  };
}

// Component definition
const IndexPage: React.SFC<IPostPropsWithData> = ({ data }) => {
  const post = data.mdx;
  return (
    <Layout>
      <SEO title={post.frontmatter.title} />
      <h1>{post.frontmatter.title}</h1>
      <MDXRenderer>{post.code.body}</MDXRenderer>
    </Layout>
  );
};

export default IndexPage;
