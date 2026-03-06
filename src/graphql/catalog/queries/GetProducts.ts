import { gql } from "@apollo/client";
import { PRODUCT_CORE_FRAGMENT } from "../fragments";

/**
 * Fetch paginated products with filtering and sorting
 * @param query - Search query string
 * @param sortKey - Field to sort by
 * @param reverse - Sort in reverse order
 * @param first - Number of items to fetch
 * @param after - Cursor for forward pagination
 * @param before - Cursor for backward pagination
 * @param channel - Sales channel
 * @param locale - Locale for localized content
 */
export const GET_PRODUCTS = gql`
  ${PRODUCT_CORE_FRAGMENT}

  query GetProducts(
    $query: String
    $sortKey: String
    $reverse: Boolean
    $first: Int
    $last: Int
    $after: String
    $before: String
    $channel: String
    $locale: String
    $filter: String
  ) {
    products(
      query: $query
      sortKey: $sortKey
      reverse: $reverse
      first: $first
      last: $last
      after: $after
      before: $before
      channel: $channel
      locale: $locale
      filter: $filter
    ) {
      totalCount
      pageInfo {
        startCursor
        endCursor
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
