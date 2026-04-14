import {ProductsSection} from "./ProductsSection";
import {Spu} from "@/types/api/product/type";

export async function RelatedProductsSection({
  fullPath,
}: {
  fullPath: string;
}) {
  // async function getRelatedProduct(urlKey: string) {
  //  return null;
  // }

  // const fetchRelatedProducts = await getRelatedProduct(fullPath);

  const relatedProducts: Spu[] = [];
  return (
    <ProductsSection
      title="Related Products"
      description="Discover the latest trends! Fresh products just added—shop new styles, tech, and essentials before they're gone."
      products={relatedProducts}
    />
  );
}