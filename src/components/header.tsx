import { Link } from "gatsby";
import React from "react";

import Icon, { ISprite } from "./icon";

import GrumpyRobin from "../assets/icons/grumpy-robin.svg";
import LogoGitHub from "../assets/icons/logo-github.svg";
import LogoGMail from "../assets/icons/logo-gmail.svg";
import LogoIMDB from "../assets/icons/logo-imdb.svg";
import LogoLinkedIn from "../assets/icons/logo-linkedin.svg";

const SocialLink: React.FunctionComponent<{ uri: string; sprite: ISprite }> = ({
  uri,
  sprite,
}) => (
  <div className="dib ph1 ph2-ns">
    <a className="link f4 f3-ns dim" target="_blank" href={uri}>
      <Icon
        sprite={sprite}
        className="w1 h1 v-base black-40 svg-fill-current-color"
      />
    </a>
  </div>
);

const Header: React.FunctionComponent<{ siteTitle: string }> = ({
  siteTitle,
}) => (
  <nav className="cf pv2 bg-accent-mono-light">
    <div className="fl dib pl2">
      <div className="dib ph1 ph2-ns">
        <Link className="link dim f4 black grumpycorp" to="/">
          <Icon sprite={GrumpyRobin} className="v-mid w2 h2" />
          GRUMPYCORP
        </Link>
      </div>
    </div>

    {
      // Drop on small screens: "dn" - don't display by default, "dib-ns" - display on non-small screens
    }
    <div className="fr dn dib-ns ph3">
      <SocialLink uri="mailto:robin@grumpycorp.com" sprite={LogoGMail} />
      <SocialLink
        uri="https://www.linkedin.com/in/robingiese"
        sprite={LogoLinkedIn}
      />

      <SocialLink
        uri="https://www.imdb.com/name/nm8515322/"
        sprite={LogoIMDB}
      />
      <SocialLink uri="https://github.com/rgiese/" sprite={LogoGitHub} />
    </div>
  </nav>
);

export default Header;
