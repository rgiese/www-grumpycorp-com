import "tachyons";
import "./layout.scss";

import React from "react";

// Interior components
const TwoColumnLayout = ({
  mainColumn,
  rightColumn = undefined,
  bodyMaxWidth = undefined,
}: {
  mainColumn: React.ReactNode;
  rightColumn?: React.ReactNode;
  bodyMaxWidth?: string;
}): JSX.Element => (
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
      <main className={`${bodyMaxWidth ?? "mw7"} center pt2`}>
        {mainColumn}
      </main>
    </div>

    <div className="fl-ns fn w-30-ns">
      <nav className="mw5 pl2 pl5-ns pb3">{rightColumn}</nav>
    </div>
  </div>
);

export default TwoColumnLayout;
