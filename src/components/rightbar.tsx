import { graphql, Link, useStaticQuery } from "gatsby";
import React from "react";

import Heart from "../assets/icons/heart.svg";
import LogoGitHub from "../assets/icons/logo-github.svg";
import LogoGMail from "../assets/icons/logo-gmail.svg";
import LogoIMDB from "../assets/icons/logo-imdb.svg";
import LogoLinkedIn from "../assets/icons/logo-linkedin.svg";
import type { Sprite } from "./icon";
import Icon from "./icon";

// Static GraphQL query
const rightBarStaticQuery = graphql`
  fragment RightBarPosts on MdxConnection {
    edges {
      node {
        fields {
          slug
        }
        frontmatter {
          title
        }
      }
    }
  }

  query rightBarStaticQuery {
    pages: allMdx(
      sort: { fields: [frontmatter___title], order: ASC }
      filter: { fields: { sourceInstanceName: { eq: "pages" } } }
    ) {
      ...RightBarPosts
    }
    portfolio: allMdx(
      sort: { fields: [frontmatter___title], order: ASC }
      filter: { fields: { sourceInstanceName: { eq: "portfolio" } } }
    ) {
      ...RightBarPosts
    }
    tagList: allMdx(
      filter: { fields: { sourceInstanceName: { eq: "posts" } } }
    ) {
      distinctTags: distinct(field: frontmatter___tags)
    }
  }
`;

/* eslint-disable react/no-multi-comp */

// Interior components
const SocialLink = ({
  uri,
  sprite,
}: {
  uri: string;
  sprite: Sprite;
}): JSX.Element => (
  <span className="pr1 pr2-ns">
    <a
      className="link dim"
      href={uri}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Icon
        className="w1 h1 v-base black-40 svg-fill-current-color"
        sprite={sprite}
      />
    </a>
  </span>
);

// Component definition
const RightBar = (): JSX.Element => {
  const data: Queries.rightBarStaticQueryQuery =
    useStaticQuery(rightBarStaticQuery);

  const footerSectionClassName = "f6 pt1";

  const linkDefaultClassName = "link dim black-80";

  return (
    <div className="f5 lh-copy center">
      {/*** Pinned ***/}
      <h4>Pinned</h4>
      {data.pages.edges.map(({ node }) => (
        <div key={node?.fields?.slug}>
          <Link className={linkDefaultClassName} to={node?.fields?.slug || ""}>
            {node?.frontmatter?.title}
          </Link>
        </div>
      ))}

      {/*** Portfolio ***/}
      <h4>Portfolio</h4>
      {data.portfolio.edges.map(({ node }) => (
        <div key={node?.fields?.slug}>
          <Link className={linkDefaultClassName} to={node?.fields?.slug || ""}>
            {node?.frontmatter?.title}
          </Link>
        </div>
      ))}

      {/*** Topics ***/}
      <h4>Topics</h4>
      <div>
        {data.tagList.distinctTags.map((tag) => (
          <Link
            className={`${linkDefaultClassName} pr2`}
            key={tag}
            to={`/tags/posts/${tag}`}
          >
            {tag}
          </Link>
        ))}
      </div>
      <div className="pt3">
        <Link className={linkDefaultClassName} to="/posts/all">
          every damn thing
        </Link>
      </div>

      {/*** "Social" links (as it were) ***/}
      <h4>Elsewhere</h4>
      <div>
        {/* Drop on small screens: "dn" - don't display by default, "dib-ns" - display on non-small screens */}
        <SocialLink sprite={LogoGMail} uri="mailto:robin@grumpycorp.com" />
        <SocialLink
          sprite={LogoLinkedIn}
          uri="https://www.linkedin.com/in/robingiese"
        />

        <SocialLink
          sprite={LogoIMDB}
          uri="https://www.imdb.com/name/nm8515322/"
        />
        <SocialLink sprite={LogoGitHub} uri="https://github.com/rgiese/" />
      </div>

      {/*** Footer-type items ***/}
      <h4>Not a colophon</h4>

      <div className={footerSectionClassName}>
        ©{new Date().getFullYear()}
        {` `}
        <a
          className={linkDefaultClassName}
          href="http://creativecommons.org/licenses/by-sa/4.0/"
          rel="license"
        >
          CC-BY-SA-4.0
        </a>
      </div>

      <div className={footerSectionClassName}>
        Made with <Icon className="v-mid w1 h1" sprite={Heart} /> in Seattle.
      </div>

      <div className={footerSectionClassName}>
        Powered by {` `}
        <a className={linkDefaultClassName} href="https://www.gatsbyjs.org">
          Gatsby
        </a>
        , {` `}
        <a className={linkDefaultClassName} href="https://tachyons.io">
          Tachyions
        </a>
        , and {` `}
        <a className={linkDefaultClassName} href="https://netlify.com">
          Netlify
        </a>
        .
      </div>

      <div className={footerSectionClassName}>
        <Link
          className={linkDefaultClassName}
          to="/posts/code/improving-site-visitor-privacy/"
        >
          Privacy notice.
        </Link>
      </div>
    </div>
  );
};

export default RightBar;
