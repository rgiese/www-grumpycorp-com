import { graphql, Link } from "gatsby";
import React from "react";

import Icon from "./icon";

import TagIcon from "../assets/icons/tag.svg";

// GraphQL fragment to be used by caller
export const tagsQueryFragment = graphql`
  fragment TagIndexTags on MdxConnection {
    distinctTags: distinct(field: frontmatter___tags)
  }
`;

// Corresponding TypeScript definition
export interface ITagIndexTags {
  distinctTags: string[];
}

// Component properties including GraphQL data
export interface ITagIndexProps {
  sourceInstanceName: string;
  tags: ITagIndexTags;
}

// Component definition
export const TagIndex: React.FunctionComponent<ITagIndexProps> = ({
  sourceInstanceName,
  tags,
}) => {
  return (
    <div>
      {tags.distinctTags.sort().map(tag => {
        return (
          <>
            <Icon sprite={TagIcon} className="w1 h1" />
            <Link to={`/tags/${sourceInstanceName}/${tag}`}>{tag}</Link>
          </>
        );
      })}
    </div>
  );
};
