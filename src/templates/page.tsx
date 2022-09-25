import { graphql, Link } from "gatsby";
import React from "react";

import Layout from "../components/layout";
import MDXPresenter from "../components/mdxPresenter";
import Seo from "../components/seo";

// Page context to be provided from ../gatsby/createPages.ts
export interface PagePageContext {
  slug: string;
  sourceInstanceName: string;
}

// Page-level GraphQL query
export const pageContentQuery = graphql`
  fragment PageTemplateFragment on Mdx {
    frontmatter {
      title
    }
  }

  query ($slug: String!) {
    page: mdx(fields: { slug: { eq: $slug } }) {
      ...PageTemplateFragment
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface PageContentData {
  page: Queries.PageTemplateFragmentFragment;
}

// Component definition
const PagePage: React.FunctionComponent<{
  children: React.ReactNode;
  data: PageContentData;
  pageContext: PagePageContext;
}> = ({ children, data, pageContext }) => {
  const page = data.page;

  return (
    <Layout>
      <Seo title={page?.frontmatter?.title} />

      {/* Page title */}
      <h1>
        <Link className="link accent" to={pageContext.slug}>
          {page?.frontmatter?.title}
        </Link>
      </h1>

      {/* Page body */}
      <div className="lh-copy content">
        <MDXPresenter data={children} />
      </div>
    </Layout>
  );
};

export default PagePage;
