import { gql } from "@apollo/client";

/**
 * Fetch product swatch and review data
 * @param urlKey - Product URL key
 */
export const GET_PRODUCT_SWATCH_REVIEW = gql`
  query ProductSwatchReview($urlKey: String!) {
    product(urlKey: $urlKey) {
      id
      name
      sku
      type
      urlKey
      price
      isSaleable
      combinations
      superAttributeOptions
      attributeValues {
        edges {
          cursor
          node {
            value
            attribute {
              adminName
              code
              isFilterable
              isVisibleOnFront
            }
          }
        }
      }
      superAttributes {
        edges {
          node {
            id
            code
            adminName
            options {
              edges {
                node {
                  id
                  adminName
                }
              }
            }
          }
        }
      }
    }
  }
`;
