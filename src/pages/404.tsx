import { Link } from "gatsby";
import React from "react";

import Icon from "../components/icon";
import Layout from "../components/layout";
import SEO from "../components/seo";

import SadTurnip from "../assets/icons/sad-turnip.svg";

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <h1>NOT FOUND</h1>
    <Icon sprite={SadTurnip} className="h4 w4" />
    <p>You just hit a page that doesn&apos;t exist... such sadness.</p>
    <p>
      Try heading{` `}
      <Link className="link accent" to="/">
        home
      </Link>
      {` `}
      or to the{` `}
      <Link className="link accent" to="/posts/all">
        post index
      </Link>
      .
    </p>
  </Layout>
);

export default NotFoundPage;
