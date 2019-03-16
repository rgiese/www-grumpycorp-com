import React from "react";

function getAnalyticsCode() {
  return (
    <React.Fragment key="simpleanalytics">
      <script async defer src="https://sa.grumpycorp.com/hello.js" />
      <noscript>
        <img src="https://sa.grumpycorp.com/hello.gif" alt="" />
      </noscript>
    </React.Fragment>
  );
}

export const onRenderBody = ({ setPostBodyComponents }, pluginOptions) => {
  setPostBodyComponents([getAnalyticsCode()]);
};
