import { Link, graphql } from "gatsby";

import Icon from "../components/icon";
import Layout from "../components/layout";
import MDXPresenter from "../components/mdxPresenter";
import React from "react";
import Seo from "../components/seo";
import TagIcon from "../assets/icons/tag.svg";

// Page context to be provided from ../gatsby/createPages.ts
export interface PostPageContext {
  slug: string;
  sourceInstanceName: string;
  previousPostSlug: string | undefined;
  nextPostSlug: string | undefined;
}

// Page-level GraphQL query
export const postContentQuery = graphql`
  fragment PreviousOrNextPostFragment on Mdx {
    fields {
      slug
    }
    frontmatter {
      title
    }
  }

  query($slug: String!, $previousPostSlug: String, $nextPostSlug: String) {
    post: mdx(fields: { slug: { eq: $slug } }) {
      body
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
    previousPost: mdx(fields: { slug: { eq: $previousPostSlug } }) {
      ...PreviousOrNextPostFragment
    }
    nextPost: mdx(fields: { slug: { eq: $nextPostSlug } }) {
      ...PreviousOrNextPostFragment
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface PreviousOrNextPostData {
  fields: {
    slug: string;
  };
  frontmatter: {
    title: string;
  };
}

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
      tags: string[];
    };
  };
  previousPost?: PreviousOrNextPostData;
  nextPost?: PreviousOrNextPostData;
}

/* eslint-disable react/no-multi-comp */

// Internal components
const PreviousNextLinks: React.FunctionComponent<{
  data: PostContentData;
  linkClass: string;
}> = ({ data, linkClass }) => {
  return (
    <table className="w-100 pv3">
      <tbody>
        <tr>
          <td className="w-50">
            {data.previousPost && (
              <Link
                className={`link ${linkClass}`}
                to={data.previousPost.fields.slug}
              >
                &laquo;{` `}
                {data.previousPost.frontmatter.title}
              </Link>
            )}
          </td>
          <td className="w-50 tr">
            {data.nextPost && (
              <Link
                className={`link ${linkClass}`}
                to={data.nextPost.fields.slug}
              >
                {data.nextPost.frontmatter.title}
                {` `}&raquo;
              </Link>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

// Component definition
const PostPage: React.FunctionComponent<{
  data: PostContentData;
  pageContext: PostPageContext; // used in GraphQL query
}> = ({ data }) => {
  const post = data.post;

  return (
    <Layout>
      <Seo title={post.frontmatter.title} />

      {/* Post title */}
      <Link className="link f2 fw2 accent sans" to={post.fields.slug}>
        {post.frontmatter.title}
      </Link>

      {/* Post date and tags */}
      <div className="pv2 f5 black-60">
        {post.frontmatter.date}
        <span className="ph2 black-40">in</span>
        {post.frontmatter.tags.map(tag => (
          <Link
            className="link accent-mono"
            key={tag}
            to={`/tags/${post.fields.sourceInstanceName}/${tag}`}
          >
            <Icon className="w1 h1 v-mid" sprite={TagIcon} />
            {` `}
            {tag}
          </Link>
        ))}
      </div>

      {/* Previous/next navigation (top) */}
      <PreviousNextLinks data={data} linkClass="black-40" />

      {/* Post body */}
      <div className="lh-copy content">
        <MDXPresenter data={post.body} />
      </div>

      {/* Previous/next navigation (bottom) */}
      <PreviousNextLinks data={data} linkClass="accent" />
    </Layout>
  );
};

export default PostPage;
