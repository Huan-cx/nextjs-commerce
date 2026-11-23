import {ProductDescription} from "./ProductDescription";
import {Spu} from "@/types/api/product/type";

export default async function ProductInfo({
                                            product,
                                            locale,
                                          }: {
  product: Spu;

  locale: string;
}) {
  return (
      <ProductDescription
          product={product}
          locale={locale}
      />
  );
}