import {cachedProductReviewRequest} from "@utils/request/useCahceRest";


export async function getProductReviews(spuId: number, type: number) {
  try {
    const response = await cachedProductReviewRequest(
        "product/comment/page",
        {
          spuId: spuId,
          type: type,
        }
        , {
          requiresAuth: true,
        }
    );

    return response?.list || [];
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching product reviews:", {
        message: error.message,
        spuId,
      });
    }
    return [];
  }
}
