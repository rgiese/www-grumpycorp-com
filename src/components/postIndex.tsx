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
export interface IPost {
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

export interface IPostIndexPosts {
  edges: Array<{
    node: IPost;
  }>;
}

// Component properties including GraphQL data
export interface IPostIndexProps {
  posts: IPostIndexPosts;
  header: React.ReactFragment;
  cardDivClass?: string;
}

// Interior component
const PostCard: React.FunctionComponent<{ post: IPost }> = ({ post }) => {
  return (
    <div
      key={post.id}
      className="flex items-center mv4 ba b--accent-mono-light"
      style={{
        borderLeftColor: "var(--accent-mono-light)",
        borderLeftWidth: "1rem",
      }}
    >
      <div className="v-mid ph4">
        <Link className="dim v-top" to={post.fields.slug}>
          <NamedIcon name={post.frontmatter.icon} className="w3 h3" />
        </Link>
      </div>
      <div className="pv3">
        {/* Title */}
        <div className="tl f3">
          <Link className="link accent" to={post.fields.slug}>
            {post.frontmatter.title}
          </Link>
        </div>

        {/* Date */}
        <div className="tl f6 black-60">{post.frontmatter.date}</div>

        {/* Description */}
        <div className="pv2 tl f5">
          <Link className="link black" to={post.fields.slug}>
            {post.frontmatter.description}
          </Link>
        </div>

        {/* Tags */}
        <div className="tl f6 pt2">
          {post.frontmatter.tags.map(tag => {
            return (
              <>
                <Link
                  className="link accent-mono"
                  to={`/tags/${post.fields.sourceInstanceName}/${tag}`}
                >
                  <Icon sprite={TagIcon} className="w1 h1 v-mid" />
                  {` `}
                  {tag}
                </Link>
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Component definition
export const PostIndex: React.FunctionComponent<IPostIndexProps> = ({
  posts,
  header,
  cardDivClass = "w-100",
}) => {
  return (
    <div className="center mw7 ph3">
      {header}

      <div className={cardDivClass}>
        {posts.edges.map(({ node }) => (
          <PostCard post={node} />
        ))}
      </div>
    </div>
  );
};
