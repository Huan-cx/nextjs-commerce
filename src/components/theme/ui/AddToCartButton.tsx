"use client";

import ShoppingCartIcon from "@components/common/icons/ShoppingCartIcon";
import clsx from "clsx";
import Link from "next/link";
import {useCart} from "@utils/hooks/useAddToCart";
import LoadingDots from "@components/common/icons/LoadingDots";
import {useCustomToast} from "@utils/hooks/useToast";
import {useAuthStatus} from "@utils/hooks/useAuthStatus";
import {ProductInfo} from "@/types/cart/type";


export default function AddToCartButton({
                                          product,
                                          isSaleable
                                        }: {
  product: ProductInfo;
  isSaleable?: boolean;
}) {
  const {isGuest} = useAuthStatus();
  const {isCartLoading, onAddToCart} = useCart();
  const { showToast } = useCustomToast();

  const handleAddToCart = () => {
    if (!isSaleable) {
      showToast("This product is out of stock", "warning");
      return;
    }

    onAddToCart({
      sku: {
        id: Number(product.sku.id),
        price: Number(product.sku.price) || 0,
        stock: product.sku?.stock || 0,
        picUrl: product.sku?.picUrl || "",
        properties: product.sku?.properties || [],
      },
      spu: {
        id: Number(product.spu.id) || 0,
        name: product.spu.name || "",
        picUrl: product.spu?.picUrl || "",
        stock: product.sku?.stock || 0,
        categoryId: product.spu?.categoryId || 0,
        status: product.spu?.status || 0,
      },
      id: 0,
      count: 1,
      selected: true,
    }, isGuest);
  };

  const buttonClasses =
      " flex w-full cursor-pointer items-center  justify-center px-4 rounded-full min-h-8  tracking-wide ";
  const disabledClasses = "cursor-wait opacity-60 hover:opacity-60";

  return product.spu.specType ? ( // Assuming specType indicates a configurable product
      <Link
          aria-disabled="true"
          aria-label={product.spu.name}
          rel="prefetch"
          prefetch={true}
          className={clsx(buttonClasses, {
            "hover:opacity-90": true,
          })}
          href={`/product/${product.spu.id}`} // Assuming spu.id is the url key
          type="submit"
      >
        <ShoppingCartIcon className="size-6 -rotate-6 stroke-black stroke-[1.5]"/>
      </Link>
  ) : (
      <button
          aria-disabled={isCartLoading || !isSaleable}
          aria-label={product.spu.name}
          className={clsx(buttonClasses, {
            "hover:opacity-90": isSaleable,
            [disabledClasses]: isCartLoading || !isSaleable,
          })}
          type="button"
          onClick={handleAddToCart}
      >
        {isCartLoading ? (
            <LoadingDots className="bg-black"/>
        ) : (
            <ShoppingCartIcon className="size-6 -rotate-6 stroke-black stroke-[1.SA]"/>
        )}
      </button>
  );
}