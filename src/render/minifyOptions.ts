import htmlMinifier from "html-minifier";

export const minifyOptions: htmlMinifier.Options = {
  collapseWhitespace: true,
  minifyCSS: true,
  removeComments: true,
};
