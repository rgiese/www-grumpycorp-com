import { Link } from "gatsby";
import React from "react";

import Icon from "./icon";

import Heart from "../assets/icons/heart.svg";

const Footer: React.FunctionComponent<{}> = () => (
  <footer className="tc pa3 mt4 black-60 bg-accent-mono-light">
    ©{new Date().getFullYear()} All rights reserved.
    {` `}
    <a
      className="link accent dim"
      rel="license"
      href="http://creativecommons.org/licenses/by-sa/4.0/"
    >
      CC-BY-SA-4.0
    </a>
    . Made with <Icon sprite={Heart} className="v-mid w1 h1" /> in Seattle.
    Powered by {` `}
    <a className="link accent dim" href="https://www.gatsbyjs.org">
      Gatsby
    </a>
    , {` `}
    <a className="link accent dim" href="https://tachyons.io">
      Tachyions
    </a>
    , and {` `}
    <a className="link accent dim" href="https://netlify.com">
      Netlify
    </a>
    .{` `}
    <Link
      to="/posts/code/improving-site-visitor-privacy/"
      className="link accent dim"
    >
      Privacy notice.
    </Link>
  </footer>
);

export default Footer;
