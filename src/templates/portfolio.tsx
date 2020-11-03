import { graphql } from "gatsby";
import React from "react";

import Layout from "../components/layout";
import MDXPresenter from "../components/mdxPresenter";
import Seo from "../components/seo";

// Page context to be provided from ../gatsby/createPages.ts
export interface PortfolioPageContext {
  slug: string;
  sourceInstanceName: string;
}

// Page-level GraphQL query
export const pageContentQuery = graphql`
  query($slug: String!) {
    page: mdx(fields: { slug: { eq: $slug } }) {
      body
      frontmatter {
        title
      }
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface PageContentData {
  page: {
    body: string;
    frontmatter: {
      title: string;
    };
  };
}

// Component definition
const PortfolioPage: React.FunctionComponent<{
  data: PageContentData;
  pageContext: PortfolioPageContext; // used in GraphQL query
}> = ({ data }) => {
  const page = data.page;

  return (
    <Layout bodyMaxWidth="mw8">
      <Seo title={page.frontmatter.title} />
      <div className="lh-copy content portfolio-container">
        <MDXPresenter data={page.body} />
      </div>
    </Layout>
  );
};

export default PortfolioPage;
