import { graphql, Link } from "gatsby";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { MDXProvider } from "@mdx-js/react";
import React from "react";

import Layout from "../components/layout";
import { PostIndexPosts, PostIndex } from "../components/postIndex";
import SEO from "../components/seo";

// "Shortcodes" for use inside of MDX
import Vimeo from "../components/vimeo";

// Page context to be provided from ../gatsby/createPages.ts
export interface PostPageContext {
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
      body
      fields {
        slug
        sourceInstanceName
      }
      frontmatter {
        title
        date(formatString: "MMMM Do, YYYY")
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
interface PostContentData {
  post: {
    body: string;
    fields: {
      slug: string;
      sourceInstanceName: string;
    };
    frontmatter: {
      title: string;
      date: string;
    };
  };
  previousPosts: PostIndexPosts;
  nextPosts: PostIndexPosts;
}

// Component definition
const PostPage: React.FunctionComponent<{
  data: PostContentData;
  pageContext: PostPageContext; // used in GraphQL query
}> = ({ data }) => {
  const post = data.post;

  return (
    <Layout>
      <SEO title={post.frontmatter.title} />

      <Link className="link f2 fw2 accent sans" to={post.fields.slug}>
        {post.frontmatter.title}
      </Link>

      <div className="pv2 f5 black-60">{post.frontmatter.date}</div>

      {/* Post body */}
      <div className="lh-copy content">
        <MDXProvider components={{ Vimeo }}>
          <MDXRenderer>{post.body}</MDXRenderer>
        </MDXProvider>
      </div>

      {/* Previous/next navigation */}
      <div className="mt4">
        {/* Some vertical padding */}
        &nbsp;
      </div>

      {data.nextPosts.edges.length > 0 && (
        <PostIndex
          posts={data.nextPosts}
          header={
            <div className="f3 tl mt3">
              Next <span className="accent-mono">by tag</span>
            </div>
          }
          cardDivClass="w-80"
        />
      )}
      {data.previousPosts.edges.length > 0 && (
        <PostIndex
          posts={data.previousPosts}
          header={
            <div className="f3 tl mt3">
              Previous <span className="accent-mono">by tag</span>
            </div>
          }
          cardDivClass="w-80"
        />
      )}
    </Layout>
  );
};

export default PostPage;
