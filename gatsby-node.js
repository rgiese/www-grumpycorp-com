// Note: Gatsby doesn't currently support ES module syntax in its configuration files
require("ts-node").register();

const { createPages, onCreateNode } = require("./src/gatsby/createPages.ts"); // eslint-disable-line @typescript-eslint/no-var-requires
exports.createPages = createPages;
exports.onCreateNode = onCreateNode;

const { onCreateWebpackConfig } = require("./src/gatsby/webpackConfig.ts"); // eslint-disable-line @typescript-eslint/no-var-requires
exports.onCreateWebpackConfig = onCreateWebpackConfig;
