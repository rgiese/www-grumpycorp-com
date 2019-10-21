import React from "react";
import { MDXProvider } from "@mdx-js/react";
import { MDXRenderer } from "gatsby-plugin-mdx";

// "Shortcodes" for use inside of MDX
import Icon from "../components/icon";
import IconTag from "../assets/icons/tag.svg";

import PortfolioPhoto from "../components/portfolioPhoto";
import Vimeo from "../components/vimeo";

const TagIcon: React.FunctionComponent<{ className: string }> = ({
  className,
}) => {
  return <Icon sprite={IconTag} className={className} />;
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
