import { Link } from "gatsby";
import React from "react";

import RightBar from "../components/rightbar";

import Icon from "../components/icon";
import GrumpyRobin from "../assets/icons/grumpy-robin.svg";
import GrumpyCorpName from "../assets/icons/grumpycorp-name.svg";

// CSS
import "tachyons";
import "./layout.scss";

// Interior components
const TwoColumnLayout: React.FunctionComponent<{
  mainColumn: React.ReactNode;
  rightColumn: React.ReactNode;
}> = ({ mainColumn, rightColumn }): React.ReactElement => (
  <>
    {/**
     * Top-level layout:
     *  - fl-ns: float-left the main div and right div for non-small (-ns) screens at 75/25 widths
     *  - fn: don't float (== stack) the main div and right div on small screens
     *
     * Main div layout:
     *  - mw7: constrain width for readability
     *  - ml-auto: flush to the right (auto left margin)
     *
     * Right div layout:
     *  - device-dependent left padding
     *  - a hint of bottom-padding for small screens
     */}

    <div className="fl-ns fn w-75-ns">
      <main className="mw7 ml-auto">{mainColumn}</main>
    </div>

    {/*** Right div ***/}
    <div className="fl-ns fn w-25-ns pl2 pl5-ns pb3">{rightColumn}</div>
  </>
);

const Layout: React.FunctionComponent<{}> = ({ children }) => (
  <div className="ph3 pt4 tl bg-white">
    {/**
     * Execute two column layout twice:
     * 1. with the logo in the main column and an empty right column
     * 2. with the main content in the main column and the <RightBar/> in the right column
     *
     * This way the tops of the main content and right content align.
     */}
    <TwoColumnLayout
      mainColumn={
        <>
          {/*** Logo ***/}
          <div className="pb4">
            <Link to="/">
              <Icon sprite={GrumpyRobin} className="v-mid w3 h3" />
              <div className="dib v-mid">
                <div>
                  <Icon sprite={GrumpyCorpName} className="v-mid h2 pl1" />
                </div>
                <div className="f4 pt1 serif accent">creative industries</div>
              </div>
            </Link>
          </div>
        </>
      }
      rightColumn={<></>}
    />

    <TwoColumnLayout mainColumn={children} rightColumn={<RightBar />} />
  </div>
);

export default Layout;
