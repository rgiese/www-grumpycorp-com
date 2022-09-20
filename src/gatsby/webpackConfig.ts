import type { GatsbyNode } from "gatsby";

// eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
const SpriteLoaderPlugin = require("svg-sprite-loader/plugin"); // Won't convert to import presumably due to svg-sprite-loader craziness.

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
