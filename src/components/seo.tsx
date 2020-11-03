import { graphql, useStaticQuery } from "gatsby";
import React from "react";
import { Helmet } from "react-helmet";

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

interface DetailsData {
  site: {
    siteMetadata: {
      title: string;
      description: string;
      author: string;
    };
  };
}

const Seo: React.FunctionComponent<{
  description?: string;
  lang?: string;
  keywords?: string[];
  title: string;
}> = ({ description, lang = "en", keywords = [], title }) => {
  const data: DetailsData = useStaticQuery(detailsQuery);
  const metaDescription = description ?? data.site.siteMetadata.description;

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
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
        keywords?.length > 0
          ? {
              content: keywords.join(`, `),
              name: `keywords`,
            }
          : []
      )}
      title={title}
      titleTemplate={`%s | ${data.site.siteMetadata.title}`}
    />
  );
};

export default Seo;
