import { graphql, Link } from "gatsby";
import React from "react";

// GraphQL fragment to be used by caller
export const postsQueryFragment = graphql`
  fragment PostIndexPosts on MdxConnection {
    nodes {
      id
      fields {
        slug
        sourceInstanceName
      }
      frontmatter {
        date
        tags
        title
      }
    }
  }
`;

// Component properties including GraphQL data
export interface PostIndexProps {
  posts: Queries.PostIndexPostsFragment["nodes"];
}

// Component definition
export const PostIndex: React.FunctionComponent<PostIndexProps> = ({
  posts,
}) => {
  return (
    <table>
      <tbody className="lh-copy v-top">
        {posts.map((node) => (
          <tr key={node.id}>
            <td>
              {node?.frontmatter?.tags
                ? node.frontmatter.tags.map((tag) => (
                    <Link
                      className="link accent-mono"
                      key={tag}
                      to={`/tags/${node.fields?.sourceInstanceName}/${tag}`}
                    >
                      {tag}
                    </Link>
                  ))
                : null}
            </td>
            <td className="b ph3">
              {new Date(node?.frontmatter?.date || "").toLocaleDateString(
                "en-us",
                {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </td>
            <td>
              <Link className="link accent" to={node?.fields?.slug || ""}>
                {node?.frontmatter?.title}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
