import { graphql, Link } from "gatsby";
import React from "react";

import Icon from "../components/icon";
import Image from "../components/image";
import Layout from "../components/layout";
import { IPostIndexPosts, PostIndex } from "../components/postIndex";
import SEO from "../components/seo";
import { ITagIndexTags, TagIndex } from "../components/tagIndex";

import GrumpyRobin from "../assets/icons/grumpy-robin.svg";

// Automatic (exported) GraphQL query
export const postIndexAndTagsQuery = graphql`
  query {
    posts: allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fields: { sourceInstanceName: { eq: "posts" } } }
    ) {
      ...PostIndexPosts
    }
    tagIndex: allMdx(
      filter: { fields: { sourceInstanceName: { eq: "posts" } } }
    ) {
      ...TagIndexTags
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface IPostIndexData {
  posts: IPostIndexPosts;
  tagIndex: ITagIndexTags;
}

const IndexPage: React.FunctionComponent<{
  data: IPostIndexData;
}> = ({ data }) => {
  return (
    <Layout>
      <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
      <h1 className="grumpycorp">Hi people</h1>
      <p>Welcome to your new Gatsby site.</p>
      <Icon sprite={GrumpyRobin} className="w3 h3" />
      <p>Now go build something great.</p>
      <PostIndex posts={data.posts} />
      <TagIndex sourceInstanceName="posts" tags={data.tagIndex} />
      <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
        <Image />
      </div>
      <Link to="/about/">About</Link>
    </Layout>
  );
};

export default IndexPage;
