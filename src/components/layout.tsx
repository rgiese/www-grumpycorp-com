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
  bodyMaxWidth?: string;
}> = ({ mainColumn, rightColumn, bodyMaxWidth }): React.ReactElement => (
  <div className="cf">
    {/**
     * Top-level layout: three divs (left = empty, main, and right)
     *  - fl-ns: float-left the for non-small (-ns) screens at [10 @ medium / 20 @ large] / 50 / 30 percent widths
     *  - fn: don't float (== stack) the divs on small screens
     *
     * Main div layout:
     *  - mw7: constrain width for readability
     *  - center: center content box
     *
     * Right div layout:
     *  - mw5: constrain width for readability
     *  - device-dependent left padding
     *  - a hint of bottom-padding for small screens
     *
     * Containing div (see above) clears floats.
     */}

    <div className="fl-ns fn w-10-m w-20-l">&nbsp;</div>

    <div className="fl-ns fn w-50-ns">
      <main className={`${bodyMaxWidth || "mw7"} center`}>{mainColumn}</main>
    </div>

    <div className="fl-ns fn w-30-ns">
      <nav className="mw5 pl2 pl5-ns pb3">{rightColumn}</nav>
    </div>
  </div>
);

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
      bodyMaxWidth={bodyMaxWidth}
    />

    <TwoColumnLayout
      mainColumn={children}
      rightColumn={<RightBar />}
      bodyMaxWidth={bodyMaxWidth}
    />
  </div>
);

export default Layout;
