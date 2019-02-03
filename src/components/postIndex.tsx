import { graphql, Link, StaticQuery } from "gatsby";
import React from "react";

// TODO: Figure out how (or whether) we should filter by post type/location.
// This may well turn into a bit of a mess.

// Component properties
interface IPostIndexProps {
  sourceName: string;
}

// Internal GraphQL query
const postIndexQuery = graphql`
  query {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fields: { sourceInstanceName: { eq: "posts" } } }
    ) {
      totalCount
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            title
            date
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
    allMarkdownRemark: {
      totalCount: number;
      edges: Array<{
        node: {
          id: string;
          fields: {
            slug: string;
          };
          frontmatter: {
            title: string;
            date: string;
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
  return (
    <div>
      <h1>
        {sourceName} {data.allMarkdownRemark.totalCount}
      </h1>
      {data.allMarkdownRemark.edges.map(({ node }) => (
        <div key={node.id}>
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
