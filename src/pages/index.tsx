import { graphql, Link } from "gatsby";
import React from "react";

import Icon from "../components/icon";
import Layout from "../components/layout";
import SEO from "../components/seo";

import { PostIndexPosts, PostIndex } from "../components/postIndex";

import ArrowRight from "../assets/icons/arrow-right.svg";

// Automatic (exported) GraphQL query
export const postIndexAndTagsQuery = graphql`
  query {
    posts: allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fields: { sourceInstanceName: { eq: "posts" } } }
      limit: 10
    ) {
      ...PostIndexPosts
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface PostIndexData {
  posts: PostIndexPosts;
}

const IndexPage: React.FunctionComponent<{
  data: PostIndexData;
}> = ({ data }) => {
  return (
    <Layout>
      <SEO title="Home" />

      {/*** Recent posts ***/}
      <PostIndex posts={data.posts} />

      {/*** Link to all posts ***/}
      <div className="center mw7 f4 tc">
        <Link className="link accent" to="/posts/all">
          <Icon
            sprite={ArrowRight}
            className="w1 h1 v-mid accent svg-fill-current-color"
          />
          {` `}All posts
        </Link>
      </div>
    </Layout>
  );
};

export default IndexPage;
