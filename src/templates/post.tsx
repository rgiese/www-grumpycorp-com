import { graphql, Link } from "gatsby";
import React from "react";

import TagIcon from "../assets/icons/tag.svg";
import Icon from "../components/icon";
import Layout from "../components/layout";
import MDXPresenter from "../components/mdxPresenter";
import Seo from "../components/seo";
import notEmpty from "../utilities/notEmpty";

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

  fragment PostTemplateFragment on Mdx {
    fields {
      slug
      sourceInstanceName
    }
    frontmatter {
      title
      date(formatString: "MMMM Do, YYYY")
      keywords
      tags
    }
  }

  query ($slug: String!, $previousPostSlug: String, $nextPostSlug: String) {
    post: mdx(fields: { slug: { eq: $slug } }) {
      ...PostTemplateFragment
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
interface PostContentData {
  post: Queries.PostTemplateFragmentFragment;
  previousPost?: Queries.PreviousOrNextPostFragmentFragment;
  nextPost?: Queries.PreviousOrNextPostFragmentFragment;
}

/* eslint-disable react/no-multi-comp */

// Internal components
const PreviousNextLinks = ({
  data,
  linkClass,
}: {
  data: PostContentData;
  linkClass: string;
}): JSX.Element => {
  return (
    <table className="w-100 pv3">
      <tbody>
        <tr>
          <td className="w-50">
            {data.previousPost ? (
              <Link
                className={`link ${linkClass}`}
                to={data.previousPost?.fields?.slug ?? ""}
              >
                &laquo;{` `}
                {data.previousPost?.frontmatter?.title}
              </Link>
            ) : null}
          </td>
          <td className="w-50 tr">
            {data.nextPost ? (
              <Link
                className={`link ${linkClass}`}
                to={data.nextPost?.fields?.slug ?? ""}
              >
                {data.nextPost?.frontmatter?.title}
                {` `}&raquo;
              </Link>
            ) : null}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

// Component definition
const PostPage = ({
  children,
  data,
}: {
  children: React.ReactNode;
  data: PostContentData;
  // eslint-disable-next-line react/no-unused-prop-types
  pageContext: PostPageContext; // used in GraphQL query
}): React.ReactNode => {
  const post = data.post;

  return post ? (
    <Layout>
      <Seo
        keywords={post.frontmatter?.keywords}
        title={post.frontmatter?.title}
      />

      {/* Post title */}
      <h1 className="mb1">
        <Link className="link accent" to={post.fields?.slug ?? ""}>
          {post.frontmatter?.title}
        </Link>
      </h1>

      {/* Post date and tags */}
      <div className="f5 black-60">
        {post.frontmatter?.date}
        <span className="ph2 black-40">in</span>
        {post.frontmatter?.tags
          ? post.frontmatter.tags.filter(notEmpty).map((tag) => (
              <Link
                className="link accent-mono"
                key={tag}
                to={`/tags/${post.fields?.sourceInstanceName ?? ""}/${tag}`}
              >
                <Icon className="w1 h1 v-mid" sprite={TagIcon} />
                {` `}
                {tag}
              </Link>
            ))
          : null}
      </div>

      {/* Previous/next navigation (top) */}
      <PreviousNextLinks data={data} linkClass="black-40" />

      {/* Post body */}
      <div className="lh-copy content">
        <MDXPresenter data={children} />
      </div>

      {/* Previous/next navigation (bottom) */}
      <PreviousNextLinks data={data} linkClass="accent" />
    </Layout>
  ) : null;
};

export default PostPage;
