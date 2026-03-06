import { gql } from "@apollo/client";

/**
 * Fetch categories for home page display
 */
export const GET_HOME_CATEGORIES = gql`
  query Categories {
    categories {
      edges {
        node {
          id
          position
          logoUrl
          translation {
            id
            name
            slug
          }
        }
      }
    }
  }
`;
