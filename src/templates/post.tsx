import { graphql } from "gatsby";
import React from "react";

import Layout from "../components/layout";
import SEO from "../components/seo";

// Page-level GraphQL query
export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
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
    markdownRemark: {
      html: string;
      frontmatter: {
        title: string;
        date: string;
      };
    };
  };
}

// Component definition
const IndexPage: React.SFC<IPostPropsWithData> = ({ data }) => {
  const post = data.markdownRemark;
  return (
    <Layout>
      <SEO title={post.frontmatter.title} />
      <h1>{post.frontmatter.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </Layout>
  );
};

export default IndexPage;
