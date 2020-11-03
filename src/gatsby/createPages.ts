import { createFilePath } from "gatsby-source-filesystem";
import { resolve } from "path";

import type { PagePageContext } from "../templates/page";
import type { PortfolioPageContext } from "../templates/portfolio";
import type { PostPageContext } from "../templates/post";
import type { TagIndexPageContext } from "../templates/tagIndex";
import type { GatsbyCreatePages, GatsbyOnCreateNode } from "./gatsby-node";

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
    const sourceInstanceName = parent.sourceInstanceName as string;

    createNodeField({
      node,
      name: `sourceInstanceName`,
      value: sourceInstanceName,
    });

    // Build slug
    const filePath = createFilePath({ node, getNode }) as string;
    const slug =
      sourceInstanceName === "pages"
        ? filePath
        : `/${sourceInstanceName}${filePath}`;

    createNodeField({
      node,
      name: `slug`,
      value: slug,
    });
  }
};

// createPages
interface Post {
  fields: {
    slug: string;
    sourceInstanceName: string;
  };
  frontmatter: {
    tags: string[];
  };
}

interface PostNodes {
  data: {
    posts: {
      edges: {
        node: Post;
      }[];
    };
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function getPostsForSourceName(
  graphql: any,
  sourceName: string
): Promise<Post[]> {
  const postNodes: PostNodes = await graphql(`
    {
      posts: allMdx(
        sort: { fields: [frontmatter___date], order: ASC }
        filter: { fields: { sourceInstanceName: { eq: "${sourceName}" } } }
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

  const posts = postNodes.data.posts.edges.map(({ node }) => node);

  return posts;
}

export const createPages: GatsbyCreatePages = async ({
  graphql,
  boundActionCreators,
}) => {
  const { createPage } = boundActionCreators;

  const tagsWithSourceInstanceName = new Set<string>();
  const tagSeparator = `/`;

  //
  // Build pages of all types (posts, standalone pages, portfolio pages)
  //

  // Build pages for posts (sort ascending for get[Next,Previous]Posts)
  const posts = await getPostsForSourceName(graphql, "posts");

  posts.forEach((post, index) => {
    const slug = post.fields.slug;
    const sourceInstanceName = post.fields.sourceInstanceName;

    const isLastPost = index === posts.length - 1;

    const postPageContext: PostPageContext = {
      slug,
      sourceInstanceName,
      previousPostSlug: index > 0 ? posts[index - 1].fields.slug : undefined,
      nextPostSlug: !isLastPost ? posts[index + 1].fields.slug : undefined,
    };

    createPage({
      path: slug,
      component: resolve(`./src/templates/post.tsx`),
      context: postPageContext,
    });

    if (isLastPost) {
      // Generate site index page from most recent post
      createPage({
        path: `/`,
        component: resolve(`./src/templates/post.tsx`),
        context: postPageContext,
      });
    }

    // Accumulate tags
    post.frontmatter.tags.forEach((tag) => {
      // Since JavaScript doesn't have a proper std::set<T>,
      // we'll just cram our two values into a delimited string.
      // Sadness.
      tagsWithSourceInstanceName.add(
        `${sourceInstanceName}${tagSeparator}${tag}`
      );
    });
  });

  // Build pages for standalone pages
  const pages = await getPostsForSourceName(graphql, "pages");

  pages.forEach((page) => {
    const slug = page.fields.slug;
    const sourceInstanceName = page.fields.sourceInstanceName;

    const pagePageContext: PagePageContext = {
      slug,
      sourceInstanceName,
    };

    createPage({
      path: slug,
      component: resolve(`./src/templates/page.tsx`),
      context: pagePageContext,
    });
  });

  // Build pages for portfolio pages
  const portfolio = await getPostsForSourceName(graphql, "portfolio");

  portfolio.forEach((page) => {
    const slug = page.fields.slug;
    const sourceInstanceName = page.fields.sourceInstanceName;

    const portfolioPageContext: PortfolioPageContext = {
      slug,
      sourceInstanceName,
    };

    createPage({
      path: slug,
      component: resolve(`./src/templates/portfolio.tsx`),
      context: portfolioPageContext,
    });
  });

  //
  // Create tag index pages across all source instances
  //

  for (const sourceInstanceNameAndTag of tagsWithSourceInstanceName) {
    const [sourceInstanceName, tag] = sourceInstanceNameAndTag.split(
      tagSeparator
    );

    const tagPageContext: TagIndexPageContext = { sourceInstanceName, tag };

    createPage({
      path: `/tags/${sourceInstanceName}/${tag}`,
      component: resolve(`./src/templates/tagIndex.tsx`),
      context: tagPageContext,
    });
  }
};
