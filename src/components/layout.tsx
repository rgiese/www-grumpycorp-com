import { graphql, StaticQuery } from "gatsby";
import React from "react";

import Footer from "./footer";
import Header from "./header";

// CSS
import "tachyons";
import "./layout.scss";

const Layout: React.FunctionComponent<{}> = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    // tslint:disable-next-line jsx-no-lambda
    render={data => (
      <div className="flex flex-column items-stretch min-vh-100 tc bg-white">
        <Header />
        <main style={{ flexGrow: 1 }}>{children}</main>
        <Footer />
      </div>
    )}
  />
);

export default Layout;
