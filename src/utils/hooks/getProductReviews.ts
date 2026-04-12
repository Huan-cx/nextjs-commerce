import {cachedProductReviewRequest} from "@utils/request/useCahceRest";


export async function getProductReviews(productId: number) {
  try {
    const response = await cachedProductReviewRequest(
        "product/comment/page",
        {
          productId: productId,
        }
    );

    return response?.list || [];
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching product reviews:", {
        message: error.message,
        productId,
        graphQLErrors: (error as unknown as Record<string, unknown>)
          .graphQLErrors,
      });
    }
    return [];
  }
}
