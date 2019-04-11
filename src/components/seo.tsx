import { graphql, StaticQuery } from "gatsby";
import React from "react";
import Helmet from "react-helmet";

const detailsQuery = graphql`
  query DefaultSEOQuery {
    site {
      siteMetadata {
        title
        description
        author
      }
    }
  }
`;

const SEO: React.FunctionComponent<{
  description?: string;
  lang?: string;
  keywords?: string[];
  title: string;
}> = ({ description, lang = "en", keywords = [], title }) => (
  <StaticQuery
    query={detailsQuery}
    render={data => {
      const metaDescription = description || data.site.siteMetadata.description;
      return (
        <Helmet
          htmlAttributes={{
            lang,
          }}
          title={title}
          titleTemplate={`%s | ${data.site.siteMetadata.title}`}
          meta={[
            {
              content: metaDescription,
              name: `description`,
            },
            {
              content: title,
              property: `og:title`,
            },
            {
              content: metaDescription,
              property: `og:description`,
            },
            {
              content: `website`,
              property: `og:type`,
            },
          ].concat(
            keywords.length > 0
              ? {
                  content: keywords.join(`, `),
                  name: `keywords`,
                }
              : []
          )}
        />
      );
    }}
  />
);

export default SEO;
