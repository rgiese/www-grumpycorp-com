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
  fragment PortfolioTemplateFragment on Mdx {
    frontmatter {
      title
    }
  }

  query ($slug: String!) {
    page: mdx(fields: { slug: { eq: $slug } }) {
      ...PortfolioTemplateFragment
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface PageContentData {
  page: Queries.PortfolioTemplateFragmentFragment;
}

// Component definition
const PortfolioPage = ({
  children,
  data,
}: {
  children: React.ReactNode;
  data: PageContentData;
  // eslint-disable-next-line react/no-unused-prop-types
  pageContext: PortfolioPageContext; // used in GraphQL query
}): React.ReactNode => {
  const page = data.page;

  return (
    <Layout bodyMaxWidth="mw8">
      <Seo title={page?.frontmatter?.title} />
      <div className="lh-copy content portfolio-container">
        <MDXPresenter data={children} />
      </div>
    </Layout>
  );
};

export default PortfolioPage;
