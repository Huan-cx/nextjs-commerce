import {ProductsSection} from "./ProductsSection";
import {Spu} from "@/types/api/product/type";
import {useTranslations} from "next-intl";

export function RelatedProductsSection(
//     {
//   fullPath,
// }: {
//   fullPath: string;
// }
) {
  const t = useTranslations("home");
  
  // async function getRelatedProduct(urlKey: string) {
  //  return null;
  // }

  // const fetchRelatedProducts = await getRelatedProduct(fullPath);

  const relatedProducts: Spu[] = [];
  return (
    <ProductsSection
        title={t("relatedProducts")}
        description={t("productCarouselDescription")}
      products={relatedProducts}
    />
  );
}