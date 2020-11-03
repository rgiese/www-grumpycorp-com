import "tachyons";
import "./layout.scss";

import { Link } from "gatsby";
import React from "react";

import StudiosLogo from "../assets/icons/studiosLogo.svg";
import RightBar from "../components/rightbar";
import Icon from "./icon";
import TwoColumnLayout from "./twoColumnLayout";

const Layout: React.FunctionComponent<{
  bodyMaxWidth?: string;
}> = ({ children, bodyMaxWidth }) => (
  <div className="ph3 pt4-ns tl bg-white">
    <TwoColumnLayout
      bodyMaxWidth={bodyMaxWidth}
      mainColumn={
        <>
          {/*** Logo on top for small screens ***/}
          <div className="mb4 dn-ns">
            <Link to="/">
              <Icon className="w5" sprite={StudiosLogo} />
            </Link>
          </div>

          {children}
        </>
      }
      rightColumn={
        <>
          {/*** Logo on the side for not-small screens ***/}
          <div className="mb4 dn db-ns">
            <Link to="/">
              <Icon className="w5" sprite={StudiosLogo} />
            </Link>
          </div>

          <RightBar />
        </>
      }
    />
  </div>
);

export default Layout;
