import { graphql, Link } from "gatsby";
import React from "react";

import Icon from "./icon";
import NamedIcon from "./namedIcon";

import TagIcon from "../assets/icons/tag.svg";

// GraphQL fragment to be used by caller
export const postsQueryFragment = graphql`
  fragment PostIndexPosts on MdxConnection {
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
          tags
          title
        }
        excerpt
      }
    }
  }
`;

// Corresponding TypeScript definition
export interface IPostIndexPosts {
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
        tags: string[];
        title: string;
      };
      excerpt: string;
    };
  }>;
}

// Component properties including GraphQL data
export interface IPostIndexProps {
  posts: IPostIndexPosts;
}

// Component definition
export const PostIndex: React.FunctionComponent<IPostIndexProps> = ({
  posts,
}) => {
  return (
    <div>
      <h1>{posts.edges.length}</h1>
      {posts.edges.map(({ node }) => (
        <div key={node.id}>
          <NamedIcon name={node.frontmatter.icon} className="w2 h2" />
          <Link to={node.fields.slug}>
            {node.frontmatter.title} — {node.frontmatter.date}
          </Link>
          <p>{node.excerpt}</p>
          {node.frontmatter.tags.map(tag => {
            return (
              <>
                <Icon sprite={TagIcon} className="w1 h1" />
                <Link to={`/tags/${node.fields.sourceInstanceName}/${tag}`}>
                  {tag}
                </Link>
              </>
            );
          })}
        </div>
      ))}
    </div>
  );
};
