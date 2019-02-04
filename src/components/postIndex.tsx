import { graphql, Link, StaticQuery } from "gatsby";
import React from "react";

import NamedIcon from "./namedIcon";

// Component properties
interface IPostIndexProps {
  sourceName: string;
}

// Internal GraphQL query
const postIndexQuery = graphql`
  query {
    allMdx(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          id
          fields {
            slug
            sourceInstanceName
          }
          frontmatter {
            date
            icon
            title
          }
          excerpt
        }
      }
    }
  }
`;

// Extend component properties with TypeScript-typed fields corresponding to GraphQL query
interface IPostIndexPropsWithData extends IPostIndexProps {
  data: {
    allMdx: {
      edges: Array<{
        node: {
          id: string;
          fields: {
            slug: string;
            sourceInstanceName: string;
          };
          frontmatter: {
            date: string;
            icon: string;
            title: string;
          };
          excerpt: string;
        };
      }>;
    };
  };
}

// Component definition
const PostIndex: React.SFC<IPostIndexPropsWithData> = ({
  sourceName,
  data,
}) => {
  const posts = data.allMdx.edges.filter(
    ({ node }) => node.fields.sourceInstanceName === sourceName
  );

  return (
    <div>
      <h1>
        {posts.length} {sourceName}
      </h1>
      {posts.map(({ node }) => (
        <div key={node.id}>
          <NamedIcon name={node.frontmatter.icon} className="w2 h2" />
          <Link to={node.fields.slug}>
            {node.frontmatter.title} — {node.frontmatter.date}
          </Link>
          <p>{node.excerpt}</p>
        </div>
      ))}
    </div>
  );
};

// Inject GraphQL and export
export default (props: IPostIndexProps) => (
  <StaticQuery
    query={postIndexQuery}
    // tslint:disable-next-line jsx-no-lambda
    render={data => <PostIndex data={data} {...props} />}
  />
);
