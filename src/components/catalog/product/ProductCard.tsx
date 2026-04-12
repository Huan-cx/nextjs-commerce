// src/components/catalog/product/ProductCard.tsx
import Link from "next/link";
import {FC} from "react";
import Grid from "@/components/theme/ui/grid/Grid";
import AddToCartButton from "@/components/theme/ui/AddToCartButton";
import {NextImage} from "@/components/common/NextImage";
import {Price} from "@/components/theme/ui/Price";
import {Spu} from "@/types/api/product/type";
import {getImageUrl, NOT_IMAGE} from "@utils/constants";

type ProductCardProps = {
  currency: string;
  product: Spu;
  sizes?: string;
  priority?: boolean;
};

export const ProductCard: FC<ProductCardProps> = ({
                                                    currency,
                                                    product,
                                                    sizes = "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw",
                                                    priority = false
                                                  }) => {
  const productType = product.skus?.length === 1 ? 'simple' : 'configurable';
  const price = product.price?.toString() || "0";
  const specialPrice = product.combinationPrice?.toString() || product.seckillPrice?.toString();
  const imageUrl = getImageUrl(
      product?.picUrl || "",
      process.env.NEXT_PUBLIC_BAGISTO_ENDPOINT,
      NOT_IMAGE
  );
  const isSaleable = product.skus && product.skus.length > 0 ? "1" : "0";

  // 获取第一个 SKU 的 ID（对于简单产品）
  const firstSkuId = product.skus && product.skus.length > 0 ? product.skus[0].id?.toString() || "" : "";

  return (
      <Grid.Item
          key={product.id}
          className="animate-fadeIn gap-y-4.5 flex flex-col"
      >
        <div className="group relative overflow-hidden rounded-lg">
          <Link href={`/product/${product.id}`} aria-label={`View ${product.name}`}>
            <div className="aspect-[353/283] h-auto truncate rounded-lg">
              <NextImage
                  alt={product?.name || "Product image"}
                  src={imageUrl}
                  width={353}
                  height={283}
                  sizes={sizes}
                  className={`rounded-lg bg-neutral-100 object-cover transition duration-300 ease-in-out group-hover:scale-105`}
                  priority={priority}
              />
            </div>
          </Link>

          <div
              className={`hidden lg:block absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-x-4 rounded-full border-[1.5px] border-white bg-white/70 px-4 py-1.5 text-xs font-semibold text-black opacity-0 shadow-2xl backdrop-blur-md duration-300 group-hover:opacity-100 dark:text-white`}
          >
            <AddToCartButton
                productType={productType}
                productId={firstSkuId}
                productUrlKey={product.id?.toString() || ""}
                isSaleable={isSaleable}
            />
          </div>
          <div
              className={`block lg:hidden absolute bottom-[10px] left-1/2 flex -translate-x-1/2 items-center gap-x-4 rounded-full border-[1.5px] border-white bg-white/70 px-3 py-0.5 md:px-4 md:py-1.5 text-xs font-semibold text-black opacity-100 shadow-2xl backdrop-blur-md duration-300 group-hover:opacity-100 dark:text-white`}
          >
            <AddToCartButton
                productType={productType}
                productId={firstSkuId}
                productUrlKey={product.id?.toString() || ""}
                isSaleable={isSaleable}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-2.5 text-sm font-medium md:text-lg">
            {product?.name}
          </h3>

          <div className="flex items-center gap-2">
            {productType === "configurable" && (
                <span className="text-xs text-gray-600 dark:text-gray-400 md:text-sm">
              As low as
            </span>
            )}
            {productType === "simple" && specialPrice ? (
                <>
                  <div className="flex items-center gap-2">
                    <Price
                        amount={specialPrice}
                        className="text-xs font-semibold md:text-sm"
                        currencyCode={currency}
                    />
                  </div>
                </>
            ) : (
                <Price
                    amount={price}
                    className="text-xs font-semibold md:text-sm"
                    currencyCode={currency}
                />
            )}
          </div>
        </div>
      </Grid.Item>
  );
};