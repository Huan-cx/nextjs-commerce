import { gql } from "@apollo/client";
import { PRODUCT_CORE_FRAGMENT } from "../fragments";

/**
 * Fetch filtered products with pagination
 * @param filter - JSON string of filter criteria
 * @param sortKey - Field to sort by
 * @param reverse - Sort in reverse order
 * @param first - Number of items to fetch forward
 * @param last - Number of items to fetch backward
 * @param after - Cursor for forward pagination
 * @param before - Cursor for backward pagination
 */
export const GET_FILTER_PRODUCTS = gql`
  ${PRODUCT_CORE_FRAGMENT}
  query getProducts(
    $filter: String
    $sortKey: String
    $reverse: Boolean
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    products(
      filter: $filter
      sortKey: $sortKey
      reverse: $reverse
      first: $first
      last: $last
      after: $after
      before: $before
    ) {
      totalCount

      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          ...ProductCore
        }
      }
    }
  }
`;
