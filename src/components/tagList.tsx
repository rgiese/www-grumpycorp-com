import { graphql, Link } from "gatsby";
import React from "react";

import Icon from "./icon";

import TagIcon from "../assets/icons/tag.svg";

// GraphQL fragment to be used by caller
export const tagsQueryFragment = graphql`
  fragment TagListTags on MdxConnection {
    distinctTags: distinct(field: frontmatter___tags)
  }
`;

// Corresponding TypeScript definition
export interface TagListTags {
  distinctTags: string[];
}

// Component properties including GraphQL data
export interface TagListProps {
  sourceInstanceName: string;
  tags: TagListTags;
  removeTags?: string[];
}

// Component definition
export const TagList: React.FunctionComponent<TagListProps> = ({
  sourceInstanceName,
  tags,
  removeTags = [],
}) => {
  const filteredTags = tags.distinctTags
    .sort()
    .filter(tag => removeTags.indexOf(tag) < 0);

  return (
    <span className="f5 black">
      {filteredTags.map(tag => {
        return (
          <span className="mr3" key={tag}>
            <Icon sprite={TagIcon} className="w1 h1" />
            {` `}
            <Link
              className="link accent-mono"
              to={`/tags/${sourceInstanceName}/${tag}`}
            >
              {tag}
            </Link>
          </span>
        );
      })}
    </span>
  );
};
