import { graphql, useStaticQuery } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
import React from "react";

// GraphQL query to retrieve all Portfolio photos
const allPhotosQuery = graphql`
  query PortfolioPhotos {
    allPhotos: allFile(
      filter: {
        sourceInstanceName: { eq: "portfolio" }
        extension: { in: ["jpg", "png"] }
      }
    ) {
      edges {
        node {
          publicURL
          relativePath
          childImageSharp {
            gatsbyImageData(layout: FULL_WIDTH)
          }
        }
      }
    }
  }
`;

const PortfolioPhoto: React.FunctionComponent<{
  src: string;
  alt?: string;
  className?: string;
}> = ({ src, alt, className }) => {
  const allPhotos: Queries.PortfolioPhotosQuery =
    useStaticQuery(allPhotosQuery);

  const thisPhotoNodes = allPhotos.allPhotos.edges.filter(
    ({ node }) => node.relativePath === src
  );

  const thisPhotoNode = thisPhotoNodes.length
    ? thisPhotoNodes[0]?.node
    : undefined;

  const imageData = thisPhotoNode?.childImageSharp?.gatsbyImageData;

  const innerHtml = imageData ? (
    <a href={thisPhotoNode?.publicURL || ""}>
      <GatsbyImage alt={alt || ""} image={imageData} />
    </a>
  ) : (
    <>Photo {src} not found.</>
  );

  // The positioning magic we're doing with CSS doesn't work if we just forward it to the Img's className
  // so we have to further the <div> forest spectacle, regrettably.
  return className !== undefined ? (
    <div className={className}>{innerHtml}</div>
  ) : (
    innerHtml
  );
};

export default PortfolioPhoto;
