import { graphql } from "gatsby";
// tslint:disable-next-line no-submodule-imports
import MDXRenderer from "gatsby-mdx/mdx-renderer";
import React from "react";

import Layout from "../components/layout";
import { IPostIndexPosts, PostIndex } from "../components/postIndex";
import SEO from "../components/seo";

// Page context to be provided from ../gatsby/createPages.ts
export interface IPostPageContext {
  slug: string;
  sourceInstanceName: string;

  previousPostSlugs: string[];
  nextPostSlugs: string[];
}

// Page-level GraphQL query
export const postContentQuery = graphql`
  query(
    $slug: String!
    $previousPostSlugs: [String]
    $nextPostSlugs: [String]
  ) {
    post: mdx(fields: { slug: { eq: $slug } }) {
      code {
        body
      }
      frontmatter {
        title
        date
      }
    }
    previousPosts: allMdx(
      filter: { fields: { slug: { in: $previousPostSlugs } } }
    ) {
      ...PostIndexPosts
    }
    nextPosts: allMdx(filter: { fields: { slug: { in: $nextPostSlugs } } }) {
      ...PostIndexPosts
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface IPostContentData {
  post: {
    code: {
      body: string;
    };
    frontmatter: {
      title: string;
      date: string;
    };
  };
  previousPosts: IPostIndexPosts;
  nextPosts: IPostIndexPosts;
}

// Component definition
const IndexPage: React.FunctionComponent<{
  data: IPostContentData;
  pageContext: IPostPageContext;
}> = ({ data, pageContext }) => {
  const post = data.post;

  return (
    <Layout>
      <SEO title={post.frontmatter.title} />
      <h1>{post.frontmatter.title}</h1>
      {data.previousPosts && (
        <div>
          Previous:
          <PostIndex posts={data.previousPosts} />
        </div>
      )}
      {data.nextPosts && (
        <div>
          Next:
          <PostIndex posts={data.nextPosts} />
        </div>
      )}
      <MDXRenderer>{post.code.body}</MDXRenderer>
    </Layout>
  );
};

export default IndexPage;
