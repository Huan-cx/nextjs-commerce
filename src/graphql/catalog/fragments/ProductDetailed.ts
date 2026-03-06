import { gql } from "@apollo/client";

export const PRODUCT_DETAILED_FRAGMENT = gql`
  fragment ProductDetailed on Product {
    id
    sku
    type
    name
    urlKey
    description
    shortDescription
    price
    baseImageUrl
    minimumPrice
    specialPrice
    isSaleable
    variants {
      edges {
        node {
          id
          sku
          baseImageUrl
        }
      }
    }
      reviews {
      edges {
        node {
          rating
        }
      }
    }
  }
`;
