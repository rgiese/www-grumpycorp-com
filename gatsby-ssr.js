import React from "react";

function getAnalyticsCode() {
  return (
    <React.Fragment key="simpleanalytics">
      <script async defer src="https://sa.grumpycorp.com/latest.js" />
      <noscript>
        <img src="https://sa.grumpycorp.com/noscript.gif" alt="" />
      </noscript>
    </React.Fragment>
  );
}

export const onRenderBody = ({ setPostBodyComponents }) => {
  setPostBodyComponents([getAnalyticsCode()]);
};
