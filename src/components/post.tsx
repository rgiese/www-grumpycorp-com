import { graphql, Link } from "gatsby";
import React from "react";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { MDXProvider } from "@mdx-js/react";

import { PostIndexPosts, PostIndex } from "./postIndex";

// "Shortcodes" for use inside of MDX
import Vimeo from "./vimeo";

export const PostContentFragment = graphql`
  fragment PostContent on Mdx {
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
`;

export interface PostContent {
  body: string;
  fields: {
    slug: string;
    sourceInstanceName: string;
  };
  frontmatter: {
    title: string;
    date: string;
  };
}

export const Post: React.FunctionComponent<{
  post: PostContent;
  previousPosts: PostIndexPosts;
  nextPosts: PostIndexPosts;
}> = ({ post, previousPosts, nextPosts }) => {
  return (
    <>
      <Link className="link f2 fw2 accent sans" to={post.fields.slug}>
        {post.frontmatter.title}
      </Link>

      <div className="pv2 f5 black-60">{post.frontmatter.date}</div>

      <div className="lh-copy content">
        <div className="lh-copy content">
          <MDXProvider components={{ Vimeo }}>
            <MDXRenderer>{post.body}</MDXRenderer>
          </MDXProvider>
        </div>
      </div>

      {/* Previous/next navigation */}
      <div className="mt4">
        {/* Some vertical padding */}
        &nbsp;
      </div>

      {nextPosts.edges.length > 0 && (
        <PostIndex
          posts={nextPosts}
          header={
            <div className="f3 tl mt3">
              Next <span className="accent-mono">by tag</span>
            </div>
          }
          cardDivClass="w-80"
        />
      )}
      {previousPosts.edges.length > 0 && (
        <PostIndex
          posts={previousPosts}
          header={
            <div className="f3 tl mt3">
              Previous <span className="accent-mono">by tag</span>
            </div>
          }
          cardDivClass="w-80"
        />
      )}
    </>
  );
};
