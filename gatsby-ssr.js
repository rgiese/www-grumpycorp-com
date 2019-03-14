import React from "react";

function getAnalyticsCode() {
  return (
    <React.Fragment key="simpleanalytics">
      <script async defer src="https://cdn.simpleanalytics.io/hello.js" />
      <noscript>
        <img src="https://api.simpleanalytics.io/hello.gif" alt="" />
      </noscript>
    </React.Fragment>
  );
}

export const onRenderBody = ({ setPostBodyComponents }, pluginOptions) => {
  setPostBodyComponents([getAnalyticsCode()]);
};
