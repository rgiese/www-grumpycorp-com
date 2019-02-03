import { createFilePath } from "gatsby-source-filesystem";
import { resolve } from "path";

import { GatsbyCreatePages, GatsbyOnCreateNode } from "./gatsby-node";

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
interface IAllMdx {
  data: {
    allMdx: {
      edges: Array<{
        node: {
          fields: {
            slug: string;
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
  const allMdx: IAllMdx = await graphql(`
    {
      allMdx(filter: { fields: { sourceInstanceName: { eq: "posts" } } }) {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
    }
  `);

  allMdx.data.allMdx.edges.forEach(({ node }) => {
    createPage({
      path: node.fields.slug,
      component: resolve(`./src/templates/post.tsx`),
      context: {
        // Data passed to context is available
        // in page queries as GraphQL variables.
        slug: node.fields.slug,
      },
    });
  });
};
