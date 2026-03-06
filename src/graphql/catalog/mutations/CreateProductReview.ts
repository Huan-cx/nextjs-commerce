import { gql } from "@apollo/client";

/**
 * Create a product review
 * @param input - Review input data
 */
export const CREATE_PRODUCT_REVIEW = gql`
  mutation CreateProductReview($input: createProductReviewInput!) {
    createProductReview(input: $input) {
      productReview {
        id
        name
        title
        rating
        comment
        status
      }
    }
  }
`;
