import { graphql, Link } from "gatsby";
import { MDXRenderer } from "gatsby-plugin-mdx";
import React from "react";

import Layout from "../components/layout";
import SEO from "../components/seo";

// Page context to be provided from ../gatsby/createPages.ts
export interface PagePageContext {
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
const PagePage: React.FunctionComponent<{
  data: PageContentData;
  pageContext: PagePageContext;
}> = ({ data, pageContext }) => {
  const page = data.page;

  return (
    <Layout>
      <SEO title={page.frontmatter.title} />

      <div className="pt3 pb1">
        <Link className="link f2 fw2 accent sans" to={pageContext.slug}>
          {page.frontmatter.title}
        </Link>
      </div>
      <div className="center mw7 tl lh-copy ph2 content">
        <MDXRenderer>{page.body}</MDXRenderer>
      </div>
    </Layout>
  );
};

export default PagePage;
