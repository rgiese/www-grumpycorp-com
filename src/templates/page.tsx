import { graphql } from "gatsby";
// tslint:disable-next-line no-submodule-imports
import MDXRenderer from "gatsby-mdx/mdx-renderer";
import React from "react";

import Layout from "../components/layout";
import SEO from "../components/seo";

// Page context to be provided from ../gatsby/createPages.ts
export interface IPagePageContext {
  slug: string;
  sourceInstanceName: string;
}

// Page-level GraphQL query
export const pageContentQuery = graphql`
  query($slug: String!) {
    page: mdx(fields: { slug: { eq: $slug } }) {
      code {
        body
      }
      frontmatter {
        title
      }
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface IPageContentData {
  page: {
    code: {
      body: string;
    };
    frontmatter: {
      title: string;
    };
  };
}

// Component definition
const PagePage: React.FunctionComponent<{
  data: IPageContentData;
  pageContext: IPagePageContext;
}> = ({ data, pageContext }) => {
  const page = data.page;

  return (
    <Layout>
      <SEO title={page.frontmatter.title} />
      <h1>{page.frontmatter.title}</h1>
      <div className="center mw7 tl lh-copy ph2">
        <MDXRenderer>{page.code.body}</MDXRenderer>
      </div>
    </Layout>
  );
};

export default PagePage;
