import { graphql, Link } from "gatsby";
import React from "react";

import Icon from "../components/icon";
import Layout from "../components/layout";
import SEO from "../components/seo";

import { PostIndexPosts, PostIndex } from "../components/postIndex";
import { TagListTags, TagList } from "../components/tagList";

import ArrowRight from "../assets/icons/arrow-right.svg";
import GrumpyRobin from "../assets/icons/grumpy-robin.svg";
import GrumpyCorpName from "../assets/icons/grumpycorp-name.svg";

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
    tagList: allMdx(
      filter: { fields: { sourceInstanceName: { eq: "posts" } } }
    ) {
      ...TagListTags
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface PostIndexData {
  posts: PostIndexPosts;
  tagList: TagListTags;
}

const IndexPage: React.FunctionComponent<{
  data: PostIndexData;
}> = ({ data }) => {
  return (
    <Layout>
      <SEO title="Home" />

      {/*** Logo ***/}
      <div className="pt5 pb4">
        <Icon sprite={GrumpyRobin} className="v-mid w3 h3" />
        <div className="dib v-mid">
          <div>
            <Icon sprite={GrumpyCorpName} className="v-mid h2 pl1" />
          </div>
          <div className="f4 pt1 serif accent">creative industries</div>
        </div>
      </div>

      {/*** Call-to-action buttons (About, (future) Hire Me) ***/}

      <div className="cf center mw6 mb4">
        <div className="fl w-100 w-50-ns pv3">
          <Link
            className="f4 link dim mh3 ph5 pv2 black bg-accent-mono-light"
            to="/about/"
          >
            About
          </Link>
        </div>
        <div className="fl w-100 w-50-ns pv3">
          <Link
            className="f4 link dim mh3 ph5 pv2 black bg-accent-mono-light"
            to="/hire-me/"
          >
            Hire me
          </Link>
        </div>
      </div>

      {/*** Recent posts ***/}
      <div className="center mw7 ph3">
        <TagList sourceInstanceName="posts" tags={data.tagList} />
      </div>

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
