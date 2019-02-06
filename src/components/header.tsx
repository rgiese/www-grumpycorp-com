import { graphql, Link, StaticQuery } from "gatsby";
import React from "react";

import Icon, { ISprite } from "./icon";
import NamedIcon from "./namedIcon";

import ArrowRight from "../assets/icons/arrow-right.svg";
import GrumpyRobin from "../assets/icons/grumpy-robin.svg";
import LogoGitHub from "../assets/icons/logo-github.svg";
import LogoGMail from "../assets/icons/logo-gmail.svg";
import LogoIMDB from "../assets/icons/logo-imdb.svg";
import LogoLinkedIn from "../assets/icons/logo-linkedin.svg";

// Static GraphQL query
const headerPostsStaticQuery = graphql`
  query HeaderPostsQuery {
    posts: allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fields: { sourceInstanceName: { eq: "posts" } } }
      limit: 5
    ) {
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM Do, YYYY")
            icon
            title
          }
        }
      }
    }
  }
`;

// TypeScript-typed fields corresponding to automatic (exported) GraphQL query
interface IHeaderData {
  posts: {
    edges: Array<{
      node: {
        id: string;
        fields: {
          slug: string;
        };
        frontmatter: {
          date: string;
          icon: string;
          title: string;
        };
      };
    }>;
  };
}

// Interior components
const SocialLink: React.FunctionComponent<{ uri: string; sprite: ISprite }> = ({
  uri,
  sprite,
}) => (
  <div className="dib ph1 ph2-ns">
    <a className="link f4 f3-ns dim" target="_blank" href={uri}>
      <Icon
        sprite={sprite}
        className="w1 h1 v-base black-40 svg-fill-current-color"
      />
    </a>
  </div>
);

// Component definition
const Header: React.FunctionComponent<{}> = () => (
  <StaticQuery
    query={headerPostsStaticQuery}
    // tslint:disable-next-line jsx-no-lambda
    render={(data: IHeaderData) => (
      <nav className="cf pv2 bg-accent-mono-light">
        <div className="fl dib pl2">
          {/*** Logo ***/}
          <div className="dib ph1 ph2-ns">
            <Link className="link dim f4 black grumpycorp" to="/">
              <Icon sprite={GrumpyRobin} className="v-mid w2 h2" />
              GRUMPYCORP
            </Link>
          </div>

          {/*** About ***/}
          <div className="dib ph1 ph2-ns">
            <Link className="link dim f5 black-80" to="/about/">
              About
            </Link>
          </div>

          {/*** Posts ***/}
          {
            // Note: We'll eventually need to introduce pagination to the index page and create a paginated post index.
            // At that time, we'll adjust the links below.
          }
          <div className="dib ph1 ph2-ns nav-hide-child">
            <Link className="link dim f5 black-80" to="/">
              Posts
            </Link>
            <div className="nav-child absolute pl0 bg-white ba b--black-20">
              {data.posts.edges.map(({ node }) => (
                <div key={node.id} className="pa2 tl">
                  <Link
                    className="link dim f5 v-base black-80"
                    to={node.fields.slug}
                  >
                    <NamedIcon
                      name={node.frontmatter.icon}
                      className="w1 h1 v-base"
                    />
                    {` `}
                    {node.frontmatter.title}
                  </Link>
                  {` `}
                  <small className="accent">{node.frontmatter.date}</small>
                </div>
              ))}

              <div className="ph2 pv3 tl w-100 bt b--black-20">
                <Link className="link dim f5 fw5 v-mid black-60" to="/">
                  <Icon
                    sprite={ArrowRight}
                    className="w1 h1 v-mid accent svg-fill-current-color"
                  />
                  {` `}
                  All posts
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/*** "Social" links (as it were) ***/}

        {/* Drop on small screens: "dn" - don't display by default, "dib-ns" - display on non-small screens */}
        <div className="fr dn dib-ns ph3">
          <SocialLink uri="mailto:robin@grumpycorp.com" sprite={LogoGMail} />
          <SocialLink
            uri="https://www.linkedin.com/in/robingiese"
            sprite={LogoLinkedIn}
          />

          <SocialLink
            uri="https://www.imdb.com/name/nm8515322/"
            sprite={LogoIMDB}
          />
          <SocialLink uri="https://github.com/rgiese/" sprite={LogoGitHub} />
        </div>
      </nav>
    )}
  />
);

export default Header;
