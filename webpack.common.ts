import * as path from "path";

import { Configuration } from "webpack";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import * as HtmlBundlerPlugin from "html-bundler-webpack-plugin";

const coreConfiguration: Configuration = {
  target: ["web", "es5"],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(css|sass|scss)$/,
        use: ["css-loader", "sass-loader"],
      },
      {
        test: /\.(yaml|yml)$/,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new CleanWebpackPlugin(), // auto-clean output directory
    new HtmlBundlerPlugin({
      entry: "./src/",
      js: {
        // output filename of JS extracted from source script specified in `<script>`
        filename: "assets/js/[name].js",
      },
      css: {
        // output filename of CSS extracted from source file specified in `<link>`
        filename: "assets/css/[name].css",
      },
    }),
  ],
  output: {
    path: path.resolve(__dirname, "dist"),
  },
};

export default coreConfiguration;
