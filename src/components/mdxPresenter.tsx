import Icon from "../components/icon";
import IconTag from "../assets/icons/tag.svg";
import { MDXProvider } from "@mdx-js/react";
import { MDXRenderer } from "gatsby-plugin-mdx";
import PortfolioPhoto from "../components/portfolioPhoto";
import React from "react";
import Vimeo from "../components/vimeo";

/* eslint-disable react/no-multi-comp */

const TagIcon: React.FunctionComponent<{ className: string }> = ({
  className,
}) => {
  return <Icon className={className} sprite={IconTag} />;
};

// Component definition
const MDXPresenter: React.FunctionComponent<{
  data: string;
}> = ({ data }) => {
  return (
    <MDXProvider components={{ Icon, TagIcon, PortfolioPhoto, Vimeo }}>
      <MDXRenderer>{data}</MDXRenderer>
    </MDXProvider>
  );
};

export default MDXPresenter;
