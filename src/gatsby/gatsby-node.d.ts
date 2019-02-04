// onCreateNode
interface IOnCreateNodeActionCreators {
  createNodeField: (opts: { node: any; name: string; value: string }) => void;
}

export type GatsbyOnCreateNode = (fns: {
  node: any;
  getNode: any;
  boundActionCreators: IOnCreateNodeActionCreators;
}) => void;

// CreatePages
interface IPageInput {
  path: string;
  component: string;
  layout?: string;
  context?: any;
}

interface ICreatePageActionCreators {
  createPage: (page: IPageInput) => void;
  deletePage: (page: IPageInput) => void;
  createRedirect: (opts: {
    fromPath: string;
    isPermanent?: boolean;
    redirectInBrowser?: boolean;
    toPath: string;
  }) => void;
}

export type GatsbyCreatePages = (fns: {
  graphql: any;
  boundActionCreators: ICreatePageActionCreators;
}) => void;

// onCreateWebpackConfig
interface IOnCreateWebpackConfigActionCreators {
  replaceWebpackConfig: (opts: { config: any }) => void;
}

export type GatsbyOnCreateWebpackConfig = (fns: {
  boundActionCreators: IOnCreateWebpackConfigActionCreators;
  getConfig: () => any;
}) => void;
