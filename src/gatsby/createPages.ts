import { createFilePath } from "gatsby-source-filesystem";
import { resolve } from "path";

import { GatsbyCreatePages, GatsbyOnCreateNode } from "./gatsby-node";

import { IPostPageContext } from "../templates/post";
import { ITagIndexPageContext } from "../templates/tagIndex";

// tslint:disable object-literal-sort-keys

// onCreateNode
export const onCreateNode: GatsbyOnCreateNode = ({
  node,
  getNode,
  boundActionCreators,
}) => {
  const { createNodeField } = boundActionCreators;

  // Create slugs and attach source instance names for Markdown content
  if (node.internal.type === `Mdx`) {
    // Get source instance name so we can filter on it in queries
    const parent = getNode(node.parent);
    const sourceInstanceName = parent.sourceInstanceName;

    createNodeField({
      node,
      name: `sourceInstanceName`,
      value: sourceInstanceName,
    });

    // Build slug
    const slug = `/${sourceInstanceName}${createFilePath({ node, getNode })}`;

    createNodeField({
      node,
      name: `slug`,
      value: slug,
    });
  }
};

// createPages
interface IPost {
  fields: {
    slug: string;
    sourceInstanceName: string;
  };
  frontmatter: {
    tags: string[];
  };
}

interface IPosts {
  data: {
    posts: {
      edges: Array<{
        node: IPost;
      }>;
    };
  };
}

function getPreviousPostForTag(
  posts: IPost[],
  currentPostIndex: number,
  tag: string
): string | undefined {
  for (let idx = currentPostIndex - 1; idx >= 0; --idx) {
    if (posts[idx].frontmatter.tags.includes(tag)) {
      return posts[idx].fields.slug;
    }
  }
}

function getNextPostForTag(
  posts: IPost[],
  currentPostIndex: number,
  tag: string
): string | undefined {
  for (let idx = currentPostIndex + 1; idx < posts.length; ++idx) {
    if (posts[idx].frontmatter.tags.includes(tag)) {
      return posts[idx].fields.slug;
    }
  }
}

export const createPages: GatsbyCreatePages = async ({
  graphql,
  boundActionCreators,
}) => {
  const { createPage } = boundActionCreators;

  const tagsWithSourceInstanceName = new Set();
  const tagSeparator = `/`;

  // Build pages for posts (sort ascending for get[Next,Previous]Posts)
  const postData: IPosts = await graphql(`
    {
      posts: allMdx(
        sort: { fields: [frontmatter___date], order: ASC }
        filter: { fields: { sourceInstanceName: { eq: "posts" } } }
      ) {
        edges {
          node {
            fields {
              slug
              sourceInstanceName
            }
            frontmatter {
              tags
            }
          }
        }
      }
    }
  `);

  const posts = postData.data.posts.edges.map(({ node }) => node);

  posts.forEach((post, index) => {
    const slug = post.fields.slug;
    const sourceInstanceName = post.fields.sourceInstanceName;

    const previousPostSlugs = post.frontmatter.tags
      .map(tag => getPreviousPostForTag(posts, index, tag))
      .filter(postSlug => postSlug !== undefined) as string[];

    const nextPostSlugs = post.frontmatter.tags
      .map(tag => getNextPostForTag(posts, index, tag))
      .filter(postSlug => postSlug !== undefined) as string[];

    const postPageContext: IPostPageContext = {
      slug,
      sourceInstanceName,
      previousPostSlugs,
      nextPostSlugs,
    };

    createPage({
      path: slug,
      component: resolve(`./src/templates/post.tsx`),
      context: postPageContext,
    });

    // Accumulate tags
    post.frontmatter.tags.forEach(tag => {
      // Since JavaScript doesn't seem to have a proper std::set<T>,
      // we'll just cram our two values into a delimited string.
      // Sadness.
      tagsWithSourceInstanceName.add(
        `${sourceInstanceName}${tagSeparator}${tag}`
      );
    });
  });

  // Create tag index pages across all source instances
  for (const sourceInstanceNameAndTag of tagsWithSourceInstanceName) {
    const [sourceInstanceName, tag] = sourceInstanceNameAndTag.split(
      tagSeparator
    );

    const tagPageContext: ITagIndexPageContext = { sourceInstanceName, tag };

    createPage({
      path: `/tags/${sourceInstanceName}/${tag}`,
      component: resolve(`./src/templates/tagIndex.tsx`),
      context: tagPageContext,
    });
  }
};
