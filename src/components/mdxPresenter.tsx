import { MDXProvider } from "@mdx-js/react";
import React from "react";

import IconTag from "../assets/icons/tag.svg";
import Icon from "../components/icon";
import PortfolioPhoto from "../components/portfolioPhoto";
import Vimeo from "../components/vimeo";
import YouTube from "../components/youtube";

/* eslint-disable react/no-multi-comp */

const TagIcon: React.FunctionComponent<{ className: string }> = ({
  className,
}) => {
  return <Icon className={className} sprite={IconTag} />;
};

// Component definition
const MDXPresenter: React.FunctionComponent<{
  data: React.ReactNode;
}> = ({ data }) => {
  // Replace paragraphs with divs so we can nest things like figcaption in them.
  const paragraphAsDiv = (
    props: React.HTMLAttributes<HTMLDivElement>
  ): React.ReactElement => {
    return <div className="mv3" {...props} />;
  };

  return (
    <MDXProvider
      components={{
        Icon,
        TagIcon,
        PortfolioPhoto,
        Vimeo,
        YouTube,
        p: paragraphAsDiv,
      }}
    >
      {data}
    </MDXProvider>
  );
};

export default MDXPresenter;
