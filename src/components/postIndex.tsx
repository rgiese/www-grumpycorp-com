import { graphql, Link } from "gatsby";
import React from "react";

import Icon from "./icon";
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
          date(formatString: "MMMM Do, YYYY")
          description
          icon
          tags
          title
        }
      }
    }
  }
`;

// Corresponding TypeScript definition
export interface Post {
  id: string;
  fields: {
    slug: string;
    sourceInstanceName: string;
  };
  frontmatter: {
    date: string;
    description: string;
    icon: string;
    tags: string[];
    title: string;
  };
}

export interface PostIndexPosts {
  edges: {
    node: Post;
  }[];
}

// Component properties including GraphQL data
export interface PostIndexProps {
  posts: PostIndexPosts;
}

// Component definition
export const PostIndex: React.FunctionComponent<PostIndexProps> = ({
  posts,
}) => {
  return (
    <table>
      <tbody className="lh-copy v-top">
        {posts.edges.map(({ node }) => (
          <tr key={node.id}>
            <td>
              {node.frontmatter.tags.map(tag => (
                <Link
                  className="link accent-mono"
                  key={tag}
                  to={`/tags/${node.fields.sourceInstanceName}/${tag}`}
                >
                  <Icon sprite={TagIcon} className="w1 h1 v-mid" />
                  {` `}
                  {tag}
                </Link>
              ))}
            </td>
            <td className="b ph3">{node.frontmatter.date}</td>
            <td>
              <Link className="link accent" to={node.fields.slug}>
                {node.frontmatter.title}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
