"use client";

import {Price, PriceWrapper} from '@/components/theme/ui/Price';
import {AddToCart} from "@/components/cart/AddToCart";
import {VariantSelector} from "./VariantSelector";
import {ProductMoreDetails} from "./ProductMoreDetail";
import {useState} from "react";
import {getVariantInfo} from "@utils/hooks/useProductVariant";
import {useSearchParams} from "next/navigation";
import Prose from "@components/theme/search/Prose";
import {safeCurrencyCode, safePriceValue} from "@utils/helper";
import Link from "@/components/common/Link";
import {I18nDataVO, Spu} from "@/types/api/product/type";
import {additionalDataTypes} from "../type";
import {useTranslationData} from "@/hooks/useTranslationData";
import {getTranslation} from "@/utils/i18n/translation";

/**
 * 从翻译列表中获取指定语言的名称
 */
function getTranslatedName(
    translations: I18nDataVO[] | undefined,
    locale: string,
    defaultValue: string
): string {
  const translation = getTranslation(translations, locale);
  return translation?.name || defaultValue;
}

const extractAdditionalData = (product: Spu, locale?: string): additionalDataTypes[] => {
  if (!product.skus || product.skus.length === 0) {
    return [];
  }

  const attributeMap = new Map<string, additionalDataTypes>();
  product.skus.forEach(sku => {
    sku.properties?.forEach(prop => {
      if (prop.propertyName && prop.valueName) {
        const key = prop.propertyName;
        if (!attributeMap.has(key)) {
          const propertyLabel = locale
              ? getTranslatedName(prop.propertyTranslations, locale, prop.propertyName)
              : prop.propertyName;
          const valueLabel = locale
              ? getTranslatedName(prop.valueTranslations, locale, prop.valueName)
              : prop.valueName;
          attributeMap.set(key, {
            attribute: {
              isVisibleOnFront: "1",
              id: prop.propertyId?.toString() || "",
              code: prop.propertyName,
              adminName: prop.propertyName,
              type: "text"
            },
            id: prop.propertyId?.toString() || "",
            code: prop.propertyName,
            label: propertyLabel,
            value: valueLabel,
            admin_name: prop.propertyName,
            type: "text"
          });
        }
      }
    });
  });

  return Array.from(attributeMap.values());
};

export function ProductDescription({
                                     product,
                                     locale,
                                   }: {
  product: Spu;
  locale: string;
}) {
  const {getName, getIntroduction, getDescription} = useTranslationData();
  const priceValue = safePriceValue(product);
  const currencyCode = safeCurrencyCode(product);
  const searchParams = useSearchParams();
  const [userInteracted, setUserInteracted] = useState(false);

  const productName = getName(product, product.name || "");
  const productIntroduction = getIntroduction(product, product.introduction || "");
  const productDescription = getDescription(product, product.description || "");

  const variantInfo = getVariantInfo(
      product,
      searchParams.toString(),
      locale
  );

  const additionalData = extractAdditionalData(product, locale);

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  return (
      <>
        <div className="mb-2 flex flex-col pb-6">
          <div className="hidden lg:flex flex-col gap-3 shrink-0 mb-2">
            <Link
                href="/"
                className="w-fit text-sm font-medium text-nowrap relative text-neutral-500 before:absolute before:bottom-0 before:left-0 before:h-px before:w-0 before:bg-current before:transition-all before:duration-300 before:content-[''] hover:text-black hover:before:w-full dark:text-neutral-400 dark:hover:text-neutral-300"
            >
              Home /
            </Link>
          </div>
          <h1 className="font-outfit text-2xl md:text-3xl lg:text-4xl font-semibold">
            {productName}
          </h1>

          <div
              className="flex w-auto justify-between items-baseline gap-y-2 py-4 xs:flex-row xs:gap-y-0 sm:py-6 flex-wrap">
            <PriceWrapper>
              <div className="flex gap-4 items-baseline">
                {(Array.isArray(product?.skus) ? product.skus.length > 1 : false) && (
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      As low as
                    </p>
                )}
                {(Array.isArray(product?.skus) ? product.skus.length <= 1 : false) ? (
                    <Price
                        amount={String(product?.price)}
                        currencyCode={currencyCode}
                        className="font-outfit text-xl md:text-2xl font-semibold"
                    />
                ) : (
                    <Price
                        amount={String(priceValue)}
                        currencyCode={currencyCode}
                        className="font-outfit text-xl md:text-2xl font-semibold"
                    />
                )}
              </div>
            </PriceWrapper>
          </div>
        </div>

        {product?.specType && (
            <VariantSelector
                variants={variantInfo?.variantAttributes}
                setUserInteracted={setUserInteracted}
            />
        )}

        {productIntroduction ? (
            <Prose className="mb-6 text-base text-selected-black dark:text-white font-light"
                   html={productIntroduction}/>
        ) : null}

        <AddToCart
            product={product}
            userInteracted={userInteracted}
        />

        <ProductMoreDetails
            additionalData={additionalData}
            description={productDescription}
            expandedKeys={expandedKeys}
            setExpandedKeys={setExpandedKeys}
        />
      </>
  );
}