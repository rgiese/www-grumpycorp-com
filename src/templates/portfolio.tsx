import { graphql } from "gatsby";
// tslint:disable-next-line no-submodule-imports
import MDXRenderer from "gatsby-mdx/mdx-renderer";
import React from "react";

import Icon from "../components/icon";
import Layout from "../components/layout";
import PortfolioPhoto from "../components/portfolioPhoto";
import SEO from "../components/seo";

import Icon_Tag from "../assets/icons/tag.svg";

// Page context to be provided from ../gatsby/createPages.ts
export interface IPortfolioPageContext {
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
const PortfolioPage: React.FunctionComponent<{
  data: IPageContentData;
  pageContext: IPortfolioPageContext;
}> = ({ data, pageContext }) => {
  const page = data.page;

  return (
    <Layout>
      <SEO title={page.frontmatter.title} />
      <div className="center tl lh-copy content portfolio-container pt2 sans">
        <MDXRenderer scope={{ Icon, Icon_Tag, PortfolioPhoto }}>
          {page.code.body}
        </MDXRenderer>
      </div>
    </Layout>
  );
};

export default PortfolioPage;
