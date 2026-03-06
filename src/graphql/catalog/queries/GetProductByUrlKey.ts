import { gql } from "@apollo/client";
import { PRODUCT_DETAILED_FRAGMENT } from "../fragments";

/**
 * Fetch a single product by URL key with all details
 * @param urlKey - Product URL key
 */
export const GET_PRODUCT_BY_URL_KEY = gql`
  ${PRODUCT_DETAILED_FRAGMENT}

  query GetProductById($urlKey: String!) {
    product(urlKey: $urlKey) {
      ...ProductDetailed
    }
  }
`;
