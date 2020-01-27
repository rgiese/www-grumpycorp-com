import React from "react";

//
// Icon: insert an SVG icon directly from an import, e.g.:
//   import GrumpyRobin from "../assets/icons/grumpy-robin.svg";
//   ...
//   <Icon sprite={GrumpyRobin} className="w3 h3" />
//

export interface Sprite {
  viewBox: string;
  url: string;
}

const Icon: React.FunctionComponent<{
  sprite: Sprite;
  className?: string;
}> = ({ sprite, className }) => (
  <svg className={className} viewBox={sprite.viewBox}>
    <use href={sprite.url} xlinkHref={sprite.url} />
  </svg>
);

export default Icon;
