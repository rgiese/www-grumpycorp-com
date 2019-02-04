import { Link } from "gatsby";
import React from "react";

import Icon from "../components/icon";
import Image from "../components/image";
import Layout from "../components/layout";
import PostIndex from "../components/postIndex";
import SEO from "../components/seo";

import GrumpyRobin from "../assets/icons/grumpy-robin.svg";

const IndexPage = () => (
  <Layout>
    <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <Icon sprite={GrumpyRobin} className="w3 h3" />
    <p>Now go build something great.</p>
    <PostIndex sourceName="posts" />
    <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
      <Image />
    </div>
    <Link to="/page-2/">Go to page 2</Link>
  </Layout>
);

export default IndexPage;
