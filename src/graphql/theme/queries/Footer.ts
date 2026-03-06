import { gql } from "@apollo/client";

export const GET_FOOTER = gql`
  query footerQuery($type: String) {
    themeCustomizations(type: $type) {
      edges {
        node {
          id
          type
          name
          status
          translations {
            edges {
              node {
                id
                themeCustomizationId
                locale
                options
              }
            }
          }
        }
      }
    }
  }
`;
