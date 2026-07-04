"use client";

import {MinusIcon, PlusIcon} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {useSearchParams} from "next/navigation";
import {useForm} from "react-hook-form";
import LoadingDots from "@components/common/icons/LoadingDots";
import {getVariantInfo} from "@utils/hooks/useSkuInfo";
import {Sku, Spu} from "@/types/api/product/type";
import {useCart} from "@utils/hooks/useAddToCart";
import {useAuthStatus} from "@utils/hooks/useAuthStatus";
import {useLocale, useTranslations} from "next-intl";
import {useRef, useState} from "react";

interface AddToCartFormData {
  quantity: number;
  isBuyNow: boolean;
}

function SubmitButton({
                        selectedVariantId,
                        pending,
                        type,
                        isSaleable,
                      }: {
  selectedVariantId: boolean;
  pending: boolean;
  type: string;
  isSaleable: boolean;
}) {
  const t = useTranslations("cart");
  const buttonClasses =
      "relative flex w-full max-w-[16rem] cursor-pointer h-fit items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white";
  const disabledClasses = "cursor-wait opacity-60";

  if (!isSaleable) {
    return (
        <button
            aria-disabled
            aria-label={t("outOfStock")}
            type="button"
            disabled
            className={clsx(buttonClasses, " opacity-60 !cursor-not-allowed")}
        >
          {t("outOfStock")}
        </button>
    );
  }

  if (!selectedVariantId && type === "configurable") {
    return (
        <button
            aria-disabled
            aria-label={t("selectOption")}
            type="button"
            disabled={!selectedVariantId}
            className={clsx(buttonClasses, " opacity-60 !cursor-not-allowed")}
        >
          {t("addToCart")}
        </button>
    );
  }

  return (
      <button
          aria-disabled={pending}
          aria-label={t("addToCart")}
          type="submit"
          className={clsx(buttonClasses, {
            "hover:opacity-90": true,
            [disabledClasses]: pending,
          })}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            if (pending) e.preventDefault();
          }}
      >
        <div className="absolute left-0 ml-4">
          {pending ? <LoadingDots className="mb-3 bg-white"/> : ""}
        </div>
        {t("addToCart")}
      </button>
  );
}

export function AddToCart({
                            product,
                            userInteracted,
                          }: {
  product: Spu;
  userInteracted: boolean;
}) {
  const {onAddToCart, isCartLoading} = useCart();
  const {isGuest} = useAuthStatus();
  const t = useTranslations("cart");
  const locale = useLocale();

  const searchParams = useSearchParams();
  const type = product?.specType ? "configurable" : "simple";

  const {productid: selectedVariantId, Instock: checkStock} = getVariantInfo(
      product,
      searchParams.toString(),
      locale
  );

  const selectedSku = product.skus?.find((item: Sku) => item.id === Number(selectedVariantId));
  const minQty = selectedSku?.minQty || product.skus?.[0]?.minQty || 0;
  const effectiveMinQty = minQty > 0 ? minQty : 1;

  const [quantity, setQuantity] = useState(effectiveMinQty);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const increment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(prev => prev + 1);
  };

  const decrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(prev => Math.max(effectiveMinQty, prev - 1));
  };

  const handleQuantityFocus = () => {
    setIsEditing(true);
  };

  const handleQuantityBlur = () => {
    setIsEditing(false);
    if (quantity < effectiveMinQty || quantity <= 0 || isNaN(quantity)) {
      setQuantity(effectiveMinQty);
    }
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setQuantity(effectiveMinQty);
    }
  };

  const {handleSubmit} = useForm<AddToCartFormData>({
    defaultValues: {
      quantity: quantity,
      isBuyNow: false,
    },
  });

  const actionWithVariant = async () => {
    const skuId = type === "configurable"
        ? String(selectedVariantId)
        : product.skus && product.skus.length > 0
            ? String(product.skus[0].id)
            : String(product.id);
    const sku = product.skus?.find((item: Sku) => item.id === Number(selectedVariantId));
    await onAddToCart({
      skuId: Number(skuId),
      name: product.name || "",
      id: Number(skuId),
      count: quantity,
      selected: true,
        sku: {
          id: Number(skuId),
          price: Number(sku?.price) || 0,
          stock: sku?.stock || 0,
          picUrl: sku?.picUrl || "",
          properties: sku?.properties || [],
          minQty: sku?.minQty,
        },
        spu: {
          id: product.id || 0,
          name: product.name || "",
          picUrl: product.picUrl || "",
          stock: product.stock || 0,
          categoryId: product.categoryId || 0,
          status: product.status || 0,
        },
    }, isGuest);
  };

  const buttonStatus = !!selectedVariantId;

  return (
      <>
        {!checkStock && type === "configurable" && userInteracted && (
            <div className="gap-1 px-2 py-1 my-2 font-bold text-red-500 dark:text-red-400">
              <h1>{t("noStockAvailable")}</h1>
            </div>
        )}

        {minQty > 0 && (
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
              {t("minOrderQty", {minQty})}
            </div>
        )}

        <form className="flex gap-x-4" onSubmit={handleSubmit(actionWithVariant)}>
          <div className="flex items-center justify-center">
            <div className="flex items-center rounded-full border-2 border-blue-500">
              <div
                  aria-label="Decrease quantity"
                  role="button"
                  className={clsx(
                      "flex h-12 w-12 cursor-pointer items-center justify-center rounded-l-full text-gray-600 transition-colors hover:text-gray-800 dark:text-white hover:dark:text-white/[80%]",
                      {"opacity-50 cursor-not-allowed": quantity <= effectiveMinQty}
                  )}
                  onClick={decrement}
              >
                <MinusIcon className="h-4 w-4"/>
              </div>

              {isEditing ? (
                  <input
                      type="number"
                      className="w-20 bg-transparent text-center font-medium text-gray-800 dark:text-white focus:outline-none"
                      value={quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setQuantity(effectiveMinQty);
                        } else {
                          const num = Number(val);
                          if (!isNaN(num) && num > 0) {
                            setQuantity(num);
                          }
                        }
                      }}
                      ref={inputRef}
                      autoFocus
                      onBlur={handleQuantityBlur}
                      onKeyDown={handleQuantityKeyDown}
                      min={effectiveMinQty}
                  />
              ) : (
                  <div
                      className="w-20 bg-transparent text-center font-medium text-gray-800 dark:text-white cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                      onClick={handleQuantityFocus}
                  >
                    {quantity}
                  </div>
              )}

              <div
                  aria-label="Increase quantity"
                  role="button"
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-r-full text-gray-600 transition-colors hover:text-gray-800 dark:text-white hover:dark:text-white/[80%]"
                  onClick={increment}
              >
                <PlusIcon className="h-4 w-4"/>
              </div>
            </div>
          </div>
          <SubmitButton
              pending={isCartLoading}
              selectedVariantId={buttonStatus}
              type={type}
              isSaleable={true}
          />
        </form>
      </>
  );
}