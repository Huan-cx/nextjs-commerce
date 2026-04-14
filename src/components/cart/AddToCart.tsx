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
  const buttonClasses =
      "relative flex w-full max-w-[16rem] cursor-pointer h-fit items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white";
  const disabledClasses = "cursor-wait opacity-60";

  if (!isSaleable) {
    return (
        <button
            aria-disabled
            aria-label="Out of stock"
            type="button"
            disabled
            className={clsx(buttonClasses, " opacity-60 !cursor-not-allowed")}
        >
          Out of Stock
        </button>
    );
  }

  if (!selectedVariantId && type === "configurable") {
    return (
        <button
            aria-disabled
            aria-label="Please select an option"
            type="button"
            disabled={!selectedVariantId}
            className={clsx(buttonClasses, " opacity-60 !cursor-not-allowed")}
        >
          Add To Cart
        </button>
    );
  }

  return (
      <button
          aria-disabled={pending}
          aria-label="Add to cart"
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
        Add To Cart
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
  // 检查是否有库存/是否可销售，临时采用全部可销售
  // const isSaleable = product?.skus && product.skus.length > 0 ||  "";
  const {onAddToCart, isCartLoading} = useCart();
  const {isGuest} = useAuthStatus();
  const {handleSubmit, setValue, register, getValues} = useForm<AddToCartFormData>({
    defaultValues: {
      quantity: 1,
      isBuyNow: false,
    },
  });

  const increment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentQuantity = getValues("quantity");
    setValue("quantity", Number(currentQuantity) + 1);
  };

  const decrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentQuantity = getValues("quantity");
    setValue("quantity", Math.max(1, Number(currentQuantity) - 1));
  };

  const searchParams = useSearchParams();
  const type = product?.specType ? "configurable" : "simple";

  const { productid: selectedVariantId, Instock: checkStock } = getVariantInfo(
      product,
      searchParams.toString(),
  );
  const buttonStatus = !!selectedVariantId;

  const actionWithVariant = async (data: AddToCartFormData) => {
    const skuId = type === "configurable"
        ? String(selectedVariantId)
        : product.skus && product.skus.length > 0
            ? String(product.skus[0].id)
            : String(product.id);
    const sku = product.skus?.find((item: Sku) => item.id === Number(selectedVariantId));
    await onAddToCart({
      id: Number(skuId),
      count: data.quantity,
      selected: true,
        sku: {
          id: Number(skuId),
          price: Number(sku?.price) || 0,
          stock: sku?.stock || 0,
          picUrl: sku?.picUrl || "",
          properties: sku?.properties || [],
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

  return (
      <>
        {!checkStock && type === "configurable" && userInteracted && (
            <div className="gap-1 px-2 py-1 my-2 font-bold text-red-500 dark:text-red-400">
              <h1>NO STOCK AVAILABLE</h1>
            </div>
        )}
        <form className="flex gap-x-4" onSubmit={handleSubmit(actionWithVariant)}>
          <div className="flex items-center justify-center">
            <div className="flex items-center rounded-full border-2 border-blue-500">
              <div
                  aria-label="Decrease quantity"
                  role="button"
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-l-full text-gray-600 transition-colors hover:text-gray-800 dark:text-white hover:dark:text-white/[80%]"
                  onClick={decrement}
              >
                <MinusIcon className="h-4 w-4"/>
              </div>

              <input
                  type="number"
                  className="w-12 bg-transparent text-center font-medium text-gray-800 dark:text-white focus:outline-none"
                  {...register("quantity", {valueAsNumber: true, min: 1})}
              />

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