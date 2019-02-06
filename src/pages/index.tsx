import { graphql, Link } from "gatsby";
import React from "react";

import Icon from "../components/icon";
import Layout from "../components/layout";
import SEO from "../components/seo";

import { IPostIndexPosts, PostIndex } from "../components/postIndex";
import { ITagListTags, TagList } from "../components/tagList";

import ArrowRight from "../assets/icons/arrow-right.svg";
import GrumpyRobin from "../assets/icons/grumpy-robin.svg";

// Automatic (exported) GraphQL query
export const postIndexAndTagsQuery = graphql`
  query {
    posts: allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fields: { sourceInstanceName: { eq: "posts" } } }
      limit: 5
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
interface IPostIndexData {
  posts: IPostIndexPosts;
  tagList: ITagListTags;
}

const IndexPage: React.FunctionComponent<{
  data: IPostIndexData;
}> = ({ data }) => {
  return (
    <Layout>
      <SEO title="Home" />

      {/*** Logo ***/}
      <div className="pt5 pb4">
        <Icon sprite={GrumpyRobin} className="v-mid w3 h3" />
        <div className="dib v-mid">
          <div className="f1 grumpycorp" style={{ lineHeight: 1 }}>
            GRUMPYCORP
          </div>
          <div className="f4 grumpycorp-extralight accent">
            creative industries
          </div>
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
            to="/hireme/"
          >
            Hire me
          </Link>
        </div>
      </div>

      {/*** Recent posts ***/}
      <div className="center mw7 ph3">
        <TagList sourceInstanceName="posts" tags={data.tagList} />
      </div>

      <PostIndex
        posts={data.posts}
        header={<div className="f3 tl mt3">Recent</div>}
      />

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
