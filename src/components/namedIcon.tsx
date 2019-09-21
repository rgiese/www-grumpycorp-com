import React from "react";
import Icon from "./icon";


const NamedIcon: React.FunctionComponent<{
  name: string;
  className?: string;
}> = ({ name, className }) =>
  {
    const sprite = require(`../assets/icons/${name}.svg`).default;
    if (sprite)
    {
      return <Icon sprite={sprite} className={className} />;
    }
    else
    {
      return null;
    }
  };

export default NamedIcon;
