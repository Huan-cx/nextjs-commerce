import {GET_RELATED_PRODUCTS} from "@/graphql";
import {ProductsSection} from "./ProductsSection";
import {cachedProductRequest} from "@/utils/hooks/useCache";

export async function RelatedProductsSection({
  fullPath,
}: {
  fullPath: string;
}) {
    async function getRelatedProduct(urlKey: string) {
      try {
        const dataById = await cachedProductRequest<any>(
          urlKey,
          GET_RELATED_PRODUCTS,
          {
            urlKey: urlKey,
            first: 4,
          }
        );
    
        return dataById?.product || null;
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching product:", {
            message: error.message,
            urlKey,
            graphQLErrors: (error as unknown as Record<string, unknown>)
              .graphQLErrors,
          });
        }
        return null;
      }
    }

    const fetchRelatedProducts = await getRelatedProduct(fullPath);

  const relatedProducts = (fetchRelatedProducts?.relatedProducts != null) && fetchRelatedProducts?.relatedProducts?.length
      ? fetchRelatedProducts.relatedProducts.map((e: any) => e)
    : [];
  return (
    <ProductsSection
      title="Related Products"
      description="Discover the latest trends! Fresh products just added—shop new styles, tech, and essentials before they're gone."
      products={relatedProducts}
    />
  );
}