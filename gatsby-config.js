siteMetadata = {
  title: `GrumpyCorp`,
  description: `Creative Industries`,
  author: `Robin Giese`,
};

module.exports = {
  siteMetadata: siteMetadata,
  plugins: [
    // TypeScript
    `gatsby-plugin-typescript`,
    // `gatsby-plugin-typescript-checker`, // Commenting out for drastically better build times, given that we have pre-commit hooks in place

    // HTML headers management
    `gatsby-plugin-react-helmet`,

    // SCSS
    `gatsby-plugin-sass`,

    // Typefaces
    {
      resolve: `gatsby-plugin-web-font-loader`,
      options: {
        google: {
          families: [`Noto Serif`, `Noto Sans`],
        },
        typekit: {
          id: `cfg7ddl`,
        },
      },
    },

    // Markdown processing
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/src/content/posts`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/content/pages`,
      },
    },
    {
      resolve: `gatsby-mdx`,
      options: {
        // See https://github.com/ChristopherBiscardi/gatsby-mdx/blob/master/examples/custom-remark-plugins/gatsby-config.js for further examples
        extensions: [`.md`, `.mdx`],
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 750,
              srcSetBreakpoints: [375, 750, 1500, 2250], // constrain some of the image processing madness (default: 188, 375, 750, 1125, 1500, 2250, 4608)
              showCaptions: true,
            },
          },
          {
            resolve: `gatsby-remark-smartypants`,
          },
        ],
      },
    },

    // Image processing pipeline
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,

    // App manifest (PWA)
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `${siteMetadata.title} ${siteMetadata.description}`,
        short_name: `${siteMetadata.title}`,
        start_url: `/`,
        background_color: `#000000`,
        theme_color: `#f26739`,
        icon: `${__dirname}/src/assets/icons/grumpy-robin.svg`,
        include_favicon: true,
      },
    },
  ],
};
