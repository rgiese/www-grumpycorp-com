import "tachyons";
import "./layout.scss";

import { Link } from "gatsby";
import React from "react";

import GrumpyRobin from "../assets/icons/grumpy-robin.svg";
import GrumpyCorpName from "../assets/icons/grumpycorp-name.svg";
import Icon from "../components/icon";
import RightBar from "../components/rightbar";
import TwoColumnLayout from "./twoColumnLayout";

const Layout: React.FunctionComponent<{
  bodyMaxWidth?: string;
}> = ({ children, bodyMaxWidth }) => (
  <div className="ph3 pt4 tl bg-white">
    {/**
     * Execute two column layout twice:
     * 1. with the logo in the main column and an empty right column
     * 2. with the main content in the main column and the <RightBar/> in the right column
     *
     * This way the tops of the main content and right content align.
     */}
    <TwoColumnLayout
      bodyMaxWidth={bodyMaxWidth}
      mainColumn={
        <>
          {/*** Logo ***/}
          <div className="pb4">
            <Link to="/">
              <Icon className="v-mid w3 h3" sprite={GrumpyRobin} />
              <div className="dib v-mid">
                <div>
                  <Icon className="v-mid h2 pl1" sprite={GrumpyCorpName} />
                </div>
                <div className="f4 pt1 serif accent">creative industries</div>
              </div>
            </Link>
          </div>
        </>
      }
    />

    <TwoColumnLayout
      bodyMaxWidth={bodyMaxWidth}
      mainColumn={children}
      rightColumn={<RightBar />}
    />
  </div>
);

export default Layout;
