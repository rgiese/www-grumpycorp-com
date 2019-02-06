import { graphql } from "gatsby";
import React from "react";

import Layout from "../../components/layout";
import SEO from "../../components/seo";

import { IPostIndexPosts, PostIndex } from "../../components/postIndex";
import { ITagListTags, TagList } from "../../components/tagList";

// Automatic (exported) GraphQL query
export const postIndexAndTagsQuery = graphql`
  query {
    posts: allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fields: { sourceInstanceName: { eq: "posts" } } }
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
      <SEO title="All posts" />
      <PostIndex
        posts={data.posts}
        header={
          <>
            <div className="f3 tl mt3">
              All posts{" "}
              <span className="accent-mono ml2">newest to oldest</span>
            </div>
            <div className="tl mt2">
              Tags: <TagList sourceInstanceName="posts" tags={data.tagList} />
            </div>
          </>
        }
      />
    </Layout>
  );
};

export default IndexPage;
