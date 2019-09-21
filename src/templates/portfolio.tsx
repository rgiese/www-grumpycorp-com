import { graphql } from "gatsby";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { MDXProvider } from "@mdx-js/react";
import React from "react";

import Layout from "../components/layout";
import NamedIcon from "../components/namedIcon";
import PortfolioPhoto from "../components/portfolioPhoto";
import SEO from "../components/seo";

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
    <Layout>
      <SEO title={page.frontmatter.title} />
      <div className="center tl lh-copy content portfolio-container pt2 sans">
        <MDXProvider components={{ NamedIcon, PortfolioPhoto }}>
          <MDXRenderer>{page.body}</MDXRenderer>
        </MDXProvider>
      </div>
    </Layout>
  );
};

export default PortfolioPage;
