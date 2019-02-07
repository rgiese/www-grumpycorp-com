import React from "react";
import Icon from "./icon";

//
// NamedIcon: use to dispatch into the `icons` SVG repository based on an icon name, e.g. from frontmatter
// (svg-sprite-loader seems to require us to formally import an SVG before it'll process it...)
//

const nameToSprite = new Map();

import ArrowRight from "../assets/icons/arrow-right.svg";
nameToSprite.set("arrow-right", ArrowRight);

import Bug from "../assets/icons/bug.svg";
nameToSprite.set("bug", Bug);

import Cottage from "../assets/icons/cottage.svg";
nameToSprite.set("cottage", Cottage);

import Movie from "../assets/icons/movie.svg";
nameToSprite.set("movie", Movie);

import RV from "../assets/icons/rv.svg";
nameToSprite.set("rv", RV);

import Vegetables from "../assets/icons/vegetables.svg";
nameToSprite.set("vegetables", Vegetables);

const NamedIcon: React.FunctionComponent<{
  name: string;
  className?: string;
}> = ({ name, className }) => {
  if (nameToSprite.has(name)) {
    return <Icon sprite={nameToSprite.get(name)} className={className} />;
  } else {
    return <> </>;
  }
};

export default NamedIcon;
