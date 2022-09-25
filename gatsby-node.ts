import { createFilePath } from "gatsby-source-filesystem";
import { resolve } from "path";
import type { GatsbyNode } from "gatsby";

// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
const SpriteLoaderPlugin = require("svg-sprite-loader/plugin"); // Won't convert to import presumably due to svg-sprite-loader craziness.

import type { PagePageContext } from "./src/templates/page";
import type { PortfolioPageContext } from "./src/templates/portfolio";
import type { PostPageContext } from "./src/templates/post";
import type { TagIndexPageContext } from "./src/templates/tagIndex";

// onCreateNode:
// - inject sourceInstanceName and slug fields into MDX nodes
export const onCreateNode: GatsbyNode["onCreateNode"] = ({
  node,
  actions,
  getNode,
}) => {
  const { createNodeField } = actions;

  // Create slugs and attach source instance names for Markdown content
  if (node.internal.type === `Mdx`) {
    // Get source instance name so we can filter on it in queries
    const parent = getNode(node.parent as string);
    const sourceInstanceName = (parent as any).sourceInstanceName as string;

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
  internal: {
    contentFilePath: string;
  }
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
            internal {
              contentFilePath
            }
          }
        }
      }
    }
  `);

  const posts = postNodes.data.posts.edges.map(({ node }) => node);

  return posts;
}

export const createPages: GatsbyNode["createPages"] = async ({
  graphql,
  actions,
}) => {
  const { createPage } = actions;

  const tagsWithSourceInstanceName = new Set<string>();
  const tagSeparator = `/`;

  //
  // Build pages of all types (posts, standalone pages, portfolio pages)
  //

  // Build pages for posts (sort ascending for get[Next,Previous]Posts)
  const posts = await getPostsForSourceName(graphql, "posts");
  const postTemplate = resolve(`./src/templates/post.tsx`)

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

    const component = `${postTemplate}?__contentFilePath=${post.internal.contentFilePath}`;
    
    createPage({
      path: slug,
      component,
      context: postPageContext,
    });

    if (isLastPost) {
      // Generate site index page from most recent post
      createPage({
        path: `/`,
        component,
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
  const pageTemplate = resolve(`./src/templates/page.tsx`)

  pages.forEach((page) => {
    const slug = page.fields.slug;
    const sourceInstanceName = page.fields.sourceInstanceName;

    const pagePageContext: PagePageContext = {
      slug,
      sourceInstanceName,
    };

    const component = `${pageTemplate}?__contentFilePath=${page.internal.contentFilePath}`;

    createPage({
      path: slug,
      component,
      context: pagePageContext,
    });
  });

  // Build pages for portfolio pages
  const portfolio = await getPostsForSourceName(graphql, "portfolio");
  const portfolioTemplate = resolve(`./src/templates/portfolio.tsx`)

  portfolio.forEach((page) => {
    const slug = page.fields.slug;
    const sourceInstanceName = page.fields.sourceInstanceName;

    const portfolioPageContext: PortfolioPageContext = {
      slug,
      sourceInstanceName,
    };

    const component = `${portfolioTemplate}?__contentFilePath=${page.internal.contentFilePath}`;
    
    createPage({
      path: slug,
      component,
      context: portfolioPageContext,
    });
  });

  //
  // Create tag index pages across all source instances
  //

  for (const sourceInstanceNameAndTag of tagsWithSourceInstanceName) {
    const wtf = sourceInstanceNameAndTag as string;
    const [sourceInstanceName, tag] = wtf.split(tagSeparator);

    const tagPageContext: TagIndexPageContext = { sourceInstanceName, tag };

    createPage({
      path: `/tags/${sourceInstanceName}/${tag}`,
      component: resolve(`./src/templates/tagIndex.tsx`),
      context: tagPageContext,
    });
  }
};
/*
export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
    stage,
    getConfig,
    actions,
  }) => {
    const { replaceWebpackConfig } = actions;
    const config = getConfig();
  
    //
    // Gatsby injects a url-loader rule for SVGs (see https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/webpack-utils.js)
    // that we need to remove in order to allow the svg-sprite-loader plugin to process SVGs instead.
    //
    // Gatsby creates the rule with a test of /\.(ico|svg|jpg|jpeg|png|gif|webp)(\?.*)?$/.
    //
    // This code is based on https://github.com/marcobiedermann/gatsby-plugin-svg-sprite/blob/master/gatsby-node.js
    // which checks for the precise text of the test expression and if found, replaces it with its own definition which simply has the svg extension removed.
    //
    // However, checking on the full text of the test and replacing it with a corrected full text feels sketchy; as such,
    // we'll just check on the |svg| sub-portion of the test regular expression and remove only that sub-portion.
    //
    config.module.rules = [
      ...config.module.rules.map((item: any) => {
        const { test } = item;
  
        const svgCheck = /\|svg/;
  
        if (test?.toString().includes("|svg")) {
          const revisedTestString = (test.toString() as string).replace(
            svgCheck,
            ""
          );
  
          return {
            ...item,
            test: new RegExp(revisedTestString),
          };
        }
  
        return { ...item };
      }),
    ];
  
    // Add rule for svg-sprite-loader
    config.module.rules = [
      ...config.module.rules,
      {
        test: /\.svg$/,
        use: [
          {
            loader: require.resolve("svg-sprite-loader"),
            options: {
              extract: true,
              //
              // Gatsby runs webpack in multiple stages so the svg-sprite-loader plugin runs multiple times.
              // We need to differentiate the outgoing extracted SVG bundle so the plugin doesn't get confused on
              // Markdown- vs. JSX-originated SVG content.
              //
              // There seems to be somewhat further magic at play here but we'll call this good enough for now since it works. Yay.
              //
              publicPath: `/assets/${stage}/`,
              spriteFilename: `icons.svg`,
            },
          },
        ],
      },
    ];
  
    // Instantiate SpriteLoaderPlugin
    config.plugins = [...config.plugins, new SpriteLoaderPlugin()];
  
    replaceWebpackConfig(config);
  };
  */
