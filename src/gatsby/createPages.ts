import { createFilePath } from "gatsby-source-filesystem";
import { resolve } from "path";

import { GatsbyCreatePages, GatsbyOnCreateNode } from "./gatsby-node";

import { PagePageContext } from "../templates/page";
import { PortfolioPageContext } from "../templates/portfolio";
import { PostPageContext } from "../templates/post";
import { TagIndexPageContext } from "../templates/tagIndex";

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
    const filePath = createFilePath({ node, getNode });
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

interface Posts {
  data: {
    posts: {
      edges: {
        node: Post;
      }[];
    };
  };
}

function getPreviousPostForTag(
  posts: Post[],
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
  posts: Post[],
  currentPostIndex: number,
  tag: string
): string | undefined {
  for (let idx = currentPostIndex + 1; idx < posts.length; ++idx) {
    if (posts[idx].frontmatter.tags.includes(tag)) {
      return posts[idx].fields.slug;
    }
  }
}

interface Pages {
  data: {
    pages: {
      edges: {
        node: {
          fields: {
            slug: string;
            sourceInstanceName: string;
          };
        };
      }[];
    };
  };
}

interface Portfolios {
  data: {
    pages: {
      edges: {
        node: {
          fields: {
            slug: string;
            sourceInstanceName: string;
          };
        };
      }[];
    };
  };
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
  const postData: Posts = await graphql(`
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

    const postPageContext: PostPageContext = {
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

  // Build pages for standalone pages
  const pageData: Pages = await graphql(`
    {
      pages: allMdx(
        filter: { fields: { sourceInstanceName: { eq: "pages" } } }
      ) {
        edges {
          node {
            fields {
              slug
              sourceInstanceName
            }
          }
        }
      }
    }
  `);

  const pages = pageData.data.pages.edges.map(({ node }) => node);

  pages.forEach(page => {
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
  const portfolioData: Portfolios = await graphql(`
    {
      pages: allMdx(
        filter: { fields: { sourceInstanceName: { eq: "portfolio" } } }
      ) {
        edges {
          node {
            fields {
              slug
              sourceInstanceName
            }
          }
        }
      }
    }
  `);

  const portfolio = portfolioData.data.pages.edges.map(({ node }) => node);

  portfolio.forEach(page => {
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
