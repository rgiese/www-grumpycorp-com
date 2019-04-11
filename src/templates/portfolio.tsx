import { graphql } from "gatsby";
import MDXRenderer from "gatsby-mdx/mdx-renderer";
import React from "react";

import Icon from "../components/icon";
import Layout from "../components/layout";
import PortfolioPhoto from "../components/portfolioPhoto";
import SEO from "../components/seo";

import IconTag from "../assets/icons/tag.svg";

// Page context to be provided from ../gatsby/createPages.ts
export interface PortfolioPageContext {
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
interface PageContentData {
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
const PortfolioPage: React.FunctionComponent<{
  data: PageContentData;
  pageContext: PortfolioPageContext; // used in GraphQL query
}> = ({ data }) => {
  const page = data.page;

  return (
    <Layout>
      <SEO title={page.frontmatter.title} />
      <div className="center tl lh-copy content portfolio-container pt2 sans">
        <MDXRenderer scope={{ Icon, IconTag: IconTag, PortfolioPhoto }}>
          {page.code.body}
        </MDXRenderer>
      </div>
    </Layout>
  );
};

export default PortfolioPage;
