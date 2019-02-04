import { createFilePath } from "gatsby-source-filesystem";
import { resolve } from "path";

import { GatsbyCreatePages, GatsbyOnCreateNode } from "./gatsby-node";

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
interface IPosts {
  data: {
    posts: {
      edges: Array<{
        node: {
          fields: {
            slug: string;
            sourceInstanceName: string;
          };
          frontmatter: {
            tags: string[];
          };
        };
      }>;
    };
  };
}

export const createPages: GatsbyCreatePages = async ({
  graphql,
  boundActionCreators,
}) => {
  const { createPage } = boundActionCreators;

  // Build pages for posts
  const postData: IPosts = await graphql(`
    {
      posts: allMdx(
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

  const tagsWithSourceInstance = new Set();
  const tagSeparator = `/`;

  postData.data.posts.edges.forEach(({ node }) => {
    const slug = node.fields.slug;
    const sourceInstanceName = node.fields.sourceInstanceName;

    createPage({
      path: slug,
      component: resolve(`./src/templates/post.tsx`),
      context: {
        slug,
        sourceInstanceName,
      },
    });

    // Accumulate tags
    node.frontmatter.tags.forEach(tag => {
      // Since JavaScript doesn't seem to have a proper std::set<T>,
      // we'll just cram our two values into a delimited string.
      // Sadness.
      tagsWithSourceInstance.add(`${sourceInstanceName}${tagSeparator}${tag}`);
    });
  });

  // Create tag index pages across all source instances
  for (const sourceInstanceNameAndTag of tagsWithSourceInstance) {
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
