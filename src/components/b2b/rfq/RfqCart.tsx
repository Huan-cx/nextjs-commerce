"use client";

import {Accordion, AccordionItem, Button, Divider, Input} from "@heroui/react";
import {ChevronLeftIcon, ChevronRightIcon, TagIcon} from "@heroicons/react/24/outline";
import {GridTileImage} from "@components/theme/ui/grid/Tile";
import {Price} from "@components/theme/ui/Price";
import Link from "@/components/common/Link";
import {useAppSelector} from "@/store/hooks";
import {NOT_IMAGE} from "@utils/constants";
import {createUrl, safeCurrencyCode} from "@utils/helper";
import {useRfqForm, useRfqSubmit} from "./stepper/index";
import {useTranslations} from "next-intl";
import {CartItem} from "@/types/api/trade/cart";
import {useEffect, useState} from "react";

interface RfqCartProps {
  currentStep: string;
  isSubmitting?: boolean;
}

type MerchandiseSearchParams = {
  [key: string]: string;
};

/**
 * 商品列表项组件
 * 移动端和 PC 端共用，避免代码重复
 */
const CartItemCard = ({
                        item,
                        index,
                        compact = false
                      }: {
  item: CartItem;
  index: number;
  compact?: boolean;
}) => {
  const t = useTranslations("b2b.createRfq");
  const {setValue, watch} = useRfqForm();
  const items = watch("items");
  const expectedPrice = items?.[index]?.expectedPrice;
  const [isEditing, setIsEditing] = useState(false);

  const merchandiseSearchParams = {} as MerchandiseSearchParams;
  const merchandiseUrl = createUrl(
      `/product/${item?.spu?.id || (item as any)?.productId}`,
      new URLSearchParams(merchandiseSearchParams)
  );

  const picUrl = item.sku?.picUrl || item.spu?.picUrl || (item as any)?.image || NOT_IMAGE;
  const productName = item.spu?.name || (item as any)?.name || "Product";
  const quantity = item.count || (item as any)?.quantity || 1;
  const price = item.sku?.price || (item as any)?.price || 0;
  const currencyCode = item?.spu ? safeCurrencyCode(item.spu) : "USD";

  const handleExpectedPriceChange = (value: string) => {
    const priceValue = value ? parseFloat(value) : undefined;
    setValue(`items.${index}.expectedPrice`, priceValue, {
      shouldValidate: true,
    });
  };

  if (compact) {
    return (
        <li className="flex w-full flex-col">
          <div className="relative flex w-full flex-col gap-2 px-1 py-3">
            <Link
                href={merchandiseUrl}
                className="z-30 flex flex-row items-center space-x-3"
                aria-label={productName}
            >
              <div
                  className="relative h-14 w-14 cursor-pointer overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700"
              >
                <GridTileImage
                    alt={productName}
                    className="h-full w-full object-cover"
                    height={56}
                    src={picUrl}
                    width={56}
                    onError={(e) => (e.currentTarget.src = NOT_IMAGE)}
                />
              </div>
              <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium text-neutral-900 line-clamp-1 dark:text-white">
                {productName}
              </span>
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                {t("quantity")}: {quantity}
              </span>
                {item?.sku?.properties && item?.sku?.properties.length > 0 && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                      {item.sku.properties.map((prop: any) => prop.valueName).join(", ")}
                    </p>
                )}
              </div>
            </Link>

            <div className="flex items-center justify-between">
              <Price
                  className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
                  amount={price.toString()}
                  currencyCode={currencyCode}
              />

              {expectedPrice ? (
                  <div className="flex items-center gap-2">
                <span className="text-xs text-primary font-medium">
                  {t("expectedPrice")}: ${expectedPrice.toFixed(2)}
                </span>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                      {isEditing ? "✕" : "✎"}
                    </button>
                  </div>
              ) : (
                  <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 text-xs text-neutral-400 hover:text-primary transition-colors"
                  >
                    <TagIcon className="w-3 h-3"/>
                    <span>{t("expectedPrice")}</span>
                  </button>
              )}
            </div>

            {isEditing && (
                <div className="mt-1">
                  <Input
                      type="number"
                      size="sm"
                      placeholder={t("expectedPricePlaceholder")}
                      value={expectedPrice?.toString() || ""}
                      onValueChange={handleExpectedPriceChange}
                      startContent={
                        <span className="text-sm text-default-400">$</span>
                      }
                      endContent={
                        <button
                            onClick={() => setIsEditing(false)}
                            className="text-xs text-neutral-400 hover:text-neutral-600"
                        >
                          ✓
                        </button>
                      }
                      classNames={{
                        base: "w-full",
                        mainWrapper: "w-full",
                        inputWrapper: "h-9 min-h-9 !rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800",
                        input: "text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500",
                      }}
              />
            </div>
            )}
          </div>
        </li>
    );
  }

  return (
      <li className="flex w-full flex-col">
        <div className="relative flex w-full flex-col gap-3">
          <Link
              className="z-30 flex flex-row items-center space-x-4"
              aria-label={productName}
              href={merchandiseUrl}
          >
            <div
                className="relative h-20 w-20 cursor-pointer rounded-xl bg-neutral-100 dark:bg-neutral-800"
            >
              <GridTileImage
                  alt={productName}
                  className="h-full w-full object-cover"
                  height={80}
                  src={picUrl}
                  width={80}
                  onError={(e) => (e.currentTarget.src = NOT_IMAGE)}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                {productName}
              </h3>
              {item?.sku?.properties && item?.sku?.properties.length > 0 && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {item.sku.properties.map((prop: any) => prop.valueName).join(", ")}
                  </p>
              )}
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t("quantity")}: {quantity}
            </span>
            </div>
            <div className="hidden xl:block">
              <Price
                  amount={price.toString()}
                  className="text-base font-semibold text-neutral-900 dark:text-white"
                  currencyCode={currencyCode}
              />
            </div>
          </Link>

          <div className="flex items-center justify-between px-1">
            <div className="xl:hidden">
            <Price
                amount={price.toString()}
                className="text-sm text-neutral-600 dark:text-neutral-400"
                currencyCode={currencyCode}
            />
          </div>

            {expectedPrice ? (
                <div className="flex items-center gap-2">
              <span className="text-sm text-primary font-medium">
                {t("expectedPrice")}: ${expectedPrice.toFixed(2)}
              </span>
                  <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    {isEditing ? "✕" : "✎"}
                  </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-primary transition-colors"
                >
                  <TagIcon className="w-4 h-4"/>
                  <span>{t("expectedPrice")}</span>
                </button>
            )}
          </div>

          {isEditing && (
              <div className="px-1">
                <Input
                    type="number"
                    size="sm"
                    placeholder={t("expectedPricePlaceholder")}
                    value={expectedPrice?.toString() || ""}
                    onValueChange={handleExpectedPriceChange}
                    startContent={
                      <span className="text-sm text-default-400">$</span>
                    }
                    endContent={
                      <button
                          onClick={() => setIsEditing(false)}
                          className="text-sm text-neutral-400 hover:text-neutral-600"
                      >
                        ✓
                      </button>
                    }
                    classNames={{
                      base: "w-full",
                      mainWrapper: "w-full",
                      inputWrapper: "h-10 min-h-10 !rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800",
                      input: "text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500",
                    }}
                />
              </div>
          )}
        </div>
      </li>
  );
};

/**
 * 摘要底部：小计 + 提交按钮
 * 移动端和 PC 端共用
 */
const CartSummary = ({
                       subtotal,
                       currencyCode,
                       itemCount,
                       isReviewStep,
                       isSubmitting = false,
                     }: {
  subtotal: number;
  currencyCode: string;
  itemCount: number;
  isReviewStep: boolean;
  isSubmitting?: boolean;
}) => {
  const t = useTranslations("b2b.createRfq");
  const handleSubmit = useRfqSubmit();

  return (
      <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
        <div className="mb-3 flex items-center justify-between pb-1">
          <p className="text-black/60 font-outfit text-base font-normal dark:text-white">
            {t("subtotal")}
          </p>
          <Price
              className="text-right text-base text-black dark:text-white"
              amount={subtotal.toString()}
              currencyCode={currencyCode}
          />
        </div>
        <div className="mb-3 flex items-center justify-between pb-1 pt-1">
          <p className="text-black/60 font-outfit text-base font-normal dark:text-white">
            {t("totalItems")}
          </p>
          <p className="text-right text-base text-black dark:text-white font-medium">
            {itemCount} {t("items")}
          </p>
        </div>
        <Divider className="my-4 dark:bg-neutral-700"/>
        {isReviewStep ? (
            <Button
                color="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
                onPress={handleSubmit}
                className="font-outfit text-base font-medium"
            >
              {t("submit")}
            </Button>
        ) : (
            <div className="text-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t("completeStepsToSubmit")}
              </p>
            </div>
        )}
      </div>
  );
};

/**
 * RFQ 购物车摘要组件
 * 支持移动端 Accordion 和 PC 端侧边栏两种显示模式
 */
export default function RfqCart({currentStep, isSubmitting}: RfqCartProps) {
  const t = useTranslations("b2b.createRfq");
  const {cart} = useAppSelector((state) => state.cartDetail);
  const {setValue} = useRfqForm();

  const isReviewStep = currentStep === "review";
  const currencyCode = cart?.items?.[0]?.spu ? safeCurrencyCode(cart.items[0].spu) : "USD";

  // 初始化购物车商品到表单
  useEffect(() => {
    if (cart?.items && cart.items.length > 0) {
      const items = cart.items.map((item: CartItem) => ({
        skuId: item.sku.id || 0,
        count: item.count || 1,
        expectedPrice: undefined,
      }));
      setValue("items", items);
    }
  }, [cart?.items, setValue]);

  // 计算预估总价
  const subtotal =
      cart?.items?.reduce((total: number, item: CartItem) => {
        const price = item.sku?.price || (item as any)?.price || 0;
        const quantity = item.count || (item as any)?.quantity || 1;
        return total + price * quantity;
      }, 0) || 0;

  const itemCount = cart?.items?.length || 0;

  return (
      <>
        {/* 移动端 Accordion */}
        <div
            className="mobile-heading fixed bottom-0 left-0 z-50 w-full border-t border-neutral-200 bg-white pb-14 dark:border-neutral-700 dark:bg-black lg:hidden">
          <Accordion selectionMode="multiple" className="!px-0">
            <AccordionItem
                key="1"
                indicator={({isOpen}) =>
                    isOpen ? (
                        <ChevronLeftIcon className="h-5 w-5 stroke-neutral-800 dark:stroke-white"/>
                    ) : (
                        <ChevronRightIcon className="h-5 w-5 stroke-neutral-800 dark:stroke-white"/>
                    )
                }
                classNames={{
                  heading: "px-4",
                  content: "px-4",
                }}
                aria-label={t("selectedItems")}
                title={t("selectedItems")}
                subtitle={
                  <Price className="" amount={subtotal.toString()} currencyCode={currencyCode}/>
                }
            >
              <div className="flex flex-col px-4">
                <ul className="max-h-[300px] overflow-y-auto py-4 pr-2 -mr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400 dark:scrollbar-thumb-neutral-500">
                  {cart?.items?.map((item: CartItem, i: number) => (
                      <CartItemCard key={i} item={item} index={i} compact={true}/>
                  ))}
                </ul>
                <CartSummary
                    subtotal={subtotal}
                    currencyCode={currencyCode}
                    itemCount={itemCount}
                    isReviewStep={isReviewStep}
                    isSubmitting={isSubmitting}
                />
              </div>
            </AccordionItem>
          </Accordion>
        </div>

        {/* PC 端版本 - Sticky 侧边栏 */}
        <div className="hidden h-full flex-col py-4 pl-4 pr-8 lg:flex">
          <div>
            <h1 className="p-6 font-outfit text-xl font-medium text-black dark:text-neutral-300">
              {t("selectedItems")}
            </h1>
            <ul className="m-0 flex flex-col gap-y-4 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400 dark:scrollbar-thumb-neutral-500">
              {cart?.items?.map((item: CartItem, i: number) => (
                  <CartItemCard key={i} item={item} index={i} compact={false}/>
              ))}
            </ul>
          </div>
          <CartSummary
              subtotal={subtotal}
              currencyCode={currencyCode}
              itemCount={itemCount}
              isReviewStep={isReviewStep}
              isSubmitting={isSubmitting}
          />
        </div>
      </>
  );
}
