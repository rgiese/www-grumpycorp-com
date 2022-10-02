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

const Seo = ({
  description = undefined,
  lang = "en",
  keywords = [],
  title = null,
}: {
  description?: string;
  lang?: string;
  keywords?: readonly (string | null)[] | null;
  title?: string | null;
}): JSX.Element => {
  const data: Queries.DefaultSEOQueryQuery = useStaticQuery(detailsQuery);
  const metaDescription =
    (description ?? data?.site?.siteMetadata?.description) || "";

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
          content: title || "",
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
        keywords && keywords?.length > 0
          ? {
              content: keywords.join(`, `),
              name: `keywords`,
            }
          : []
      )}
      title={title || ""}
      titleTemplate={`%s | ${data?.site?.siteMetadata?.title}`}
    />
  );
};

export default Seo;
