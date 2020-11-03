import { Link } from "gatsby";
import React from "react";

import SadTurnip from "../assets/icons/sad-turnip.svg";
import Icon from "../components/icon";
import Layout from "../components/layout";
import Seo from "../components/seo";

function NotFoundPage(): React.ReactElement {
  return (
    <Layout>
      <Seo title="404: Not found" />
      <h1>NOT FOUND</h1>
      <Icon className="h4 w4" sprite={SadTurnip} />
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
}

export default NotFoundPage;
