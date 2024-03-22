import * as path from "path";

import type { Configuration as DevServerConfiguration } from "webpack-dev-server";
import { Configuration } from "webpack";
import { merge } from "webpack-merge";

import commonConfiguration from "./webpack.common";

const devServerConfiguration: DevServerConfiguration = {
  static: path.resolve(__dirname, "./dist"),
  compress: true,
  port: 5055,
  open: false, // Set to `true` to automatically open new browser tab
};

const devConfiguration: Configuration = {
  mode: "development",
  devtool: "inline-source-map",
  devServer: devServerConfiguration,
};

const config = merge(commonConfiguration, devConfiguration);
export default config;
