import {getAverageRating} from "@utils/helper";
import {ProductDescription} from "./ProductDescription";
import {getProductReviews} from "@utils/hooks/getProductReviews";
import {Spu} from "@/types/api/product/type";

export default async function ProductInfo({
                                            product,
                                            slug,
                                          }: {
  product: Spu;
  slug: string;
}) {
  const reviews = await getProductReviews(product.id || 0, 0);

  return (
      <ProductDescription
          product={product}
          slug={slug}
          reviews={reviews}
          totalReview={reviews.length}
          avgRating={getAverageRating(reviews)}
      />
  );
}