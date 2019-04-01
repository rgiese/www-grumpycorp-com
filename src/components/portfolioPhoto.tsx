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
interface IAllPhotos {
  allPhotos: {
    edges: Array<{
      node: {
        relativePath: string;
        childImageSharp: any;
      };
    }>;
  };
}

const PortfolioPhoto: React.FunctionComponent<{
  src: string;
  alt?: string;
}> = ({ src, alt }) => {
  const allPhotos: IAllPhotos = useStaticQuery(allPhotosQuery);

  const thisPhotoNodes = allPhotos.allPhotos.edges.filter(
    ({ node }) => node.relativePath === src
  );

  if (thisPhotoNodes.length > 0) {
    const thisPhoto = thisPhotoNodes[0].node;
    return <Img fluid={thisPhoto.childImageSharp.fluid} alt={alt} />;
  } else {
    return <>Photo {src} not found.</>;
  }
};

export default PortfolioPhoto;
