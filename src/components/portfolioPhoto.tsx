import { graphql, useStaticQuery } from "gatsby";
import Img from "gatsby-image";
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
          relativePath
          childImageSharp {
            fluid(maxWidth: 1500) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
`;

// TypeScript-typed fields corresponding to GraphQL query
interface AllPhotos {
  allPhotos: {
    edges: {
      node: {
        relativePath: string;
        childImageSharp: any;
      };
    }[];
  };
}

const PortfolioPhoto: React.FunctionComponent<{
  src: string;
  alt?: string;
  className?: string;
}> = ({ src, alt, className }) => {
  const allPhotos: AllPhotos = useStaticQuery(allPhotosQuery);

  const thisPhotoNodes = allPhotos.allPhotos.edges.filter(
    ({ node }) => node.relativePath === src
  );

  const innerHtml =
    thisPhotoNodes.length > 0 ? (
      <Img fluid={thisPhotoNodes[0].node.childImageSharp.fluid} alt={alt} />
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
