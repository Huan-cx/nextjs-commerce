"use client";

import ShoppingCartIcon from "@components/common/icons/ShoppingCartIcon";
import clsx from "clsx";
import Link from "next/link";
import {useCart} from "@utils/hooks/useAddToCart";
import LoadingDots from "@components/common/icons/LoadingDots";
import {useCustomToast} from "@utils/hooks/useToast";

export default function AddToCartButton({
                                          productType,
                                          productUrlKey,
                                          productId,
                                          isSaleable
                                        }: {
  productType?: string;
  productId: string;
  productUrlKey: string;
  isSaleable?: string;
}) {
  const {isCartLoading, onAddToCart} = useCart();
  const { showToast } = useCustomToast();

  const handleAddToCart = () => {
    if (!isSaleable || isSaleable === "") {
      showToast("This product is out of stock", "warning");
      return;
    }

    onAddToCart({
      skuId: productId,
      count: 1,
    });
  };

  const buttonClasses =
      " flex w-full cursor-pointer items-center  justify-center px-4 rounded-full min-h-8  tracking-wide ";
  const disabledClasses = "cursor-wait opacity-60 hover:opacity-60";

  return productType !== "simple" ? (
      <Link
          aria-disabled="true"
          aria-label={productUrlKey}
          rel="prefetch"
          prefetch={true}
          className={clsx(buttonClasses, {
            "hover:opacity-90": true,
          })}
          href={`/product/${productUrlKey}`}
          type="submit"
      >
        <ShoppingCartIcon className="size-6 -rotate-6 stroke-black stroke-[1.5]"/>
      </Link>
  ) : (
      <button
          aria-disabled={isCartLoading || !isSaleable || isSaleable === ""}
          aria-label={productUrlKey}
          className={clsx(buttonClasses, {
            "hover:opacity-90": isSaleable && isSaleable !== "",
            [disabledClasses]: isCartLoading || !isSaleable || isSaleable === "",
          })}
          type="button"
          onClick={handleAddToCart}
      >
        {isCartLoading ? (
            <LoadingDots className="bg-black"/>
        ) : (
            <ShoppingCartIcon className="size-6 -rotate-6 stroke-black stroke-[1.5]"/>
        )}
      </button>
  );
}