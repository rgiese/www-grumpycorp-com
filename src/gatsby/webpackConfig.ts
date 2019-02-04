import { GatsbyOnCreateWebpackConfig } from "./gatsby-node";

// tslint:disable-next-line no-var-requires no-submodule-imports
const SpriteLoaderPlugin = require("svg-sprite-loader/plugin"); // Won't convert to import presumably due to svg-sprite-loader craziness.

export const onCreateWebpackConfig: GatsbyOnCreateWebpackConfig = ({
  boundActionCreators,
  getConfig,
}) => {
  const { replaceWebpackConfig } = boundActionCreators;
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

      if (test && svgCheck.test(test.toString())) {
        const revisedTestString = test.toString().replace(svgCheck, "");

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
            publicPath: `/assets/`,
            spriteFilename: `icons.svg`,
          },
        },
        {
          loader: "svgo-loader",
          options: {},
        },
      ],
    },
  ];

  // Instantiate SpriteLoaderPlugin
  config.plugins = [...config.plugins, new SpriteLoaderPlugin()];

  replaceWebpackConfig(config);
};
