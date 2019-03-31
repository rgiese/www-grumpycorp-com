import { graphql, Link } from "gatsby";
// tslint:disable-next-line no-submodule-imports
import MDXRenderer from "gatsby-mdx/mdx-renderer";
import React from "react";

import Icon from "../components/icon";
import Layout from "../components/layout";
import { IPostIndexPosts, PostIndex } from "../components/postIndex";
import SEO from "../components/seo";

import TagIcon from "../assets/icons/tag.svg";

// "Shortcodes" for use inside of MDX
import Vimeo from "../components/vimeo";

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
      fields {
        slug
        sourceInstanceName
      }
      frontmatter {
        title
        date(formatString: "MMMM Do, YYYY")
        tags
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
    fields: {
      slug: string;
      sourceInstanceName: string;
    };
    frontmatter: {
      title: string;
      date: string;
      tags: string[];
    };
  };
  previousPosts: IPostIndexPosts;
  nextPosts: IPostIndexPosts;
}

// Component definition
const PostPage: React.FunctionComponent<{
  data: IPostContentData;
  pageContext: IPostPageContext;
}> = ({ data, pageContext }) => {
  const post = data.post;

  return (
    <Layout>
      <SEO title={post.frontmatter.title} />

      <div className="pt3 pb1">
        <Link className="link f2 fw2 accent sans" to={post.fields.slug}>
          {post.frontmatter.title}
        </Link>
      </div>

      <div className="pa1 f5 black-60">{post.frontmatter.date}</div>

      <div>
        {post.frontmatter.tags.map(tag => {
          return (
            <>
              <Link
                className="link accent-mono"
                to={`/tags/${post.fields.sourceInstanceName}/${tag}`}
              >
                <Icon sprite={TagIcon} className="w1 h1 v-mid" />
                {` `}
                {tag}
              </Link>
            </>
          );
        })}
      </div>

      {/* Post body */}
      <div className="center mw7 tl lh-copy ph2 content">
        <MDXRenderer scope={{ Vimeo }}>{post.code.body}</MDXRenderer>
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
