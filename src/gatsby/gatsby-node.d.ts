// onCreateNode
interface OnCreateNodeActionCreators {
  createNodeField: (opts: { node: any; name: string; value: string }) => void;
}

export type GatsbyOnCreateNode = (fns: {
  node: any;
  getNode: any;
  boundActionCreators: OnCreateNodeActionCreators;
}) => void;

// CreatePages
interface PageInput {
  path: string;
  component: string;
  layout?: string;
  context?: any;
}

interface CreatePageActionCreators {
  createPage: (page: PageInput) => void;
  deletePage: (page: PageInput) => void;
  createRedirect: (opts: {
    fromPath: string;
    isPermanent?: boolean;
    redirectInBrowser?: boolean;
    toPath: string;
  }) => void;
}

export type GatsbyCreatePages = (fns: {
  graphql: any;
  boundActionCreators: CreatePageActionCreators;
}) => void;

// onCreateWebpackConfig
interface OnCreateWebpackConfigActionCreators {
  replaceWebpackConfig: (opts: { config: any }) => void;
}

export type GatsbyOnCreateWebpackConfig = (fns: {
  stage: string;
  boundActionCreators: OnCreateWebpackConfigActionCreators;
  getConfig: () => any;
}) => void;
