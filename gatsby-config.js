module.exports = {
  siteMetadata: {
    title: `GrumpyCorp`,
    description: `Creative Industries`,
    author: `Robin Giese`,
  },
  plugins: [
    // TypeScript
    `gatsby-plugin-typescript`,
    `gatsby-plugin-typescript-checker`, // Consider commenting out for drastically better build times

    // HTML headers management
    `gatsby-plugin-react-helmet`,

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
  ],
}
