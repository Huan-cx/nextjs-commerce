import {ProductDescription} from "./ProductDescription";
import {Spu} from "@/types/api/product/type";

export default async function ProductInfo({
                                            product,
                                            slug,
                                          }: {
  product: Spu;
  slug: string;
}) {
  return (
      <ProductDescription
          product={product}
          slug={slug}
      />
  );
}