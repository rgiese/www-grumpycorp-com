import { graphql, Link } from "gatsby";
// tslint:disable-next-line no-submodule-imports
import MDXRenderer from "gatsby-mdx/mdx-renderer";
import React from "react";

import Icon from "../components/icon";
import Layout from "../components/layout";
import SEO from "../components/seo";

import TagIcon from "../assets/icons/tag.svg";

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
        tags
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
      tags: string[];
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

      <div className="pt3 pb1">
        <Link className="link f2 fw2 accent sans" to={pageContext.slug}>
          {page.frontmatter.title}
        </Link>
      </div>
      <div className="pt2 f5">
        <span className="sans accent-mono pr2">Associated posts:</span>
        {page.frontmatter.tags.map(tag => {
          return (
            <>
              <Link className="link accent-mono" to={`/tags/posts/${tag}`}>
                <Icon sprite={TagIcon} className="w1 h1 v-mid" />
                {` `}
                {tag}
              </Link>
            </>
          );
        })}
      </div>
      <div className="center mw7 tl lh-copy ph2 content">
        <MDXRenderer>{page.code.body}</MDXRenderer>
      </div>
    </Layout>
  );
};

export default PortfolioPage;
