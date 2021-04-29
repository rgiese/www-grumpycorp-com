// onCreateNode
interface OnCreateNodeActions {
  createNodeField: (opts: { node: any; name: string; value: string }) => void;
}

export type GatsbyOnCreateNode = (fns: {
  node: any;
  actions: OnCreateNodeActions;
  getNode: (ID: string) => Node;
}) => void;

// CreatePages
interface PageInput {
  path: string;
  component: string;
  layout?: string;
  context?: any;
}

interface CreatePageActions {
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
  actions: CreatePageActions;
}) => void;

// onCreateWebpackConfig
interface OnCreateWebpackConfigActions {
  replaceWebpackConfig: (config: any) => void;
}

export type GatsbyOnCreateWebpackConfig = (fns: {
  stage: string;
  getConfig: () => any;
  actions: OnCreateWebpackConfigActions;
}) => void;
