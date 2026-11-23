import {ProductCard} from "./ProductCard";

export default function ProductGridItems({
  products,
}: {
  products: any;
}) {
  return products.map((product: any, index: number) => {

    const currency = product?.priceHtml?.currencyCode;
    return (
      <ProductCard
        key={index}
        currency={currency}
        product={product}
      />
    );
  });
}
