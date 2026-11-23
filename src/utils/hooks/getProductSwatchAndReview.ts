import {cachedProductRequest} from "@/utils/request/useCahceRest";
import {Spu} from "@/types/api/product/type";


export async function getProductWithSwatchAndReview(productId: number
) {
  try {
    const dataById = await cachedProductRequest<Spu>(
        productId,
        `product/spu/get-detail`,
        {
          productId: productId,
        }
    );
    return dataById || null;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching product:", {
        message: error.message,
        productId,
        graphQLErrors: (error as unknown as Record<string, unknown>)
          .graphQLErrors,
      });
    }
    return null;
  }
}