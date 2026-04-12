"use client";

import {Price} from "@/components/theme/ui/Price";
import {Rating} from "@/components/common/Rating";
import {AddToCart} from "@/components/cart/AddToCart";
import {VariantSelector} from "./VariantSelector";
import {ProductMoreDetails} from "./ProductMoreDetail";
import {useState} from "react";
import {getVariantInfo} from "@utils/hooks/useSkuInfo";
import {useSearchParams} from "next/navigation";
import Prose from "@components/theme/search/Prose";
import {safeCurrencyCode, safePriceValue} from "@utils/helper";
import Link from "next/link";
import {Comment, Spu} from "@/types/api/product/type";
import {additionalDataTypes} from "../type";

// 从 Spu 中提取附加属性
const extractAdditionalData = (product: Spu): additionalDataTypes[] => {
  if (!product.skus || product.skus.length === 0) {
    return [];
  }

  // 收集所有唯一的属性
  const attributeMap = new Map<string, additionalDataTypes>();

  product.skus.forEach(sku => {
    sku.properties?.forEach(prop => {
      if (prop.propertyName && prop.valueName) {
        const key = prop.propertyName;
        if (!attributeMap.has(key)) {
          attributeMap.set(key, {
            attribute: {
              isVisibleOnFront: "1", // 默认为可见
              id: prop.propertyId?.toString() || "",
              code: prop.propertyName,
              adminName: prop.propertyName,
              type: "text"
            },
            id: prop.propertyId?.toString() || "",
            code: prop.propertyName,
            label: prop.propertyName,
            value: prop.valueName,
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
                                     reviews,
                                     totalReview,
                                     avgRating
                                   }: {
  product: Spu;
  slug: string;
  reviews: Comment[];
  avgRating: number;
  totalReview: number;
}) {
  const priceValue = safePriceValue(product);
  const currencyCode = safeCurrencyCode(product);
  const searchParams = useSearchParams();
  const [userInteracted, setUserInteracted] = useState(false);

  const variantInfo = getVariantInfo(
      product,
      searchParams.toString()
  );

  // 从 Spu 中提取附加属性
  const additionalData = extractAdditionalData(product);

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const handleReviewClick = () => {
    setExpandedKeys(new Set(["2"]));
  };

  return (
      <>
        <div className="mb-2 flex flex-col pb-6">
          {/* Breadcrumb */}
          <div className="hidden lg:flex flex-col gap-3 shrink-0 mb-2">
            <Link
                href="/"
                className="w-fit text-sm font-medium text-nowrap relative text-neutral-500 before:absolute before:bottom-0 before:left-0 before:h-px before:w-0 before:bg-current before:transition-all before:duration-300 before:content-[''] hover:text-black hover:before:w-full dark:text-neutral-400 dark:hover:text-neutral-300"
            >
              Home /
            </Link>
          </div>
          <h1 className="font-outfit text-2xl md:text-3xl lg:text-4xl font-semibold">
            {product?.name || ""}
          </h1>

          <div
              className="flex w-auto justify-between items-baseline gap-y-2 py-4 xs:flex-row xs:gap-y-0 sm:py-6 flex-wrap">
            <div className="flex gap-4 items-baseline">
              {(Array.isArray(product?.skus) ? product.skus.length > 1 : false) && (
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    As low as
                  </p>
              )}
              {(Array.isArray(product?.skus) ? product.skus.length <= 1 : false) ? (
                  <>
                    <Price
                        amount={String(product?.price)}
                        currencyCode={currencyCode}
                        className="font-outfit text-xl md:text-2xl font-semibold"
                    />
                  </>
              ) : (
                  <Price
                      amount={String(priceValue)}
                      currencyCode={currencyCode}
                      className="font-outfit text-xl md:text-2xl font-semibold"
                  />
              )}
            </div>

            <Rating
                length={5}
                star={avgRating}
                reviewCount={totalReview}
                className="mt-2"
                onReviewClick={handleReviewClick}
            />
          </div>
        </div>

        {product?.specType && (
            <VariantSelector
                variants={variantInfo?.variantAttributes}
                setUserInteracted={setUserInteracted}
                possibleOptions={variantInfo.possibleOptions}
            />
        )}

        {product?.introduction ? (
            <Prose className="mb-6 text-base text-selected-black dark:text-white font-light"
                   html={product.introduction}/>
        ) : null}

        <AddToCart
            product={product}
            userInteracted={userInteracted}
        />

        <ProductMoreDetails
            additionalData={additionalData}
            description={product?.description ?? ""}
            reviews={Array.isArray(reviews) ? reviews : []}
            totalReview={totalReview}
            productId={product?.id || 0}
            expandedKeys={expandedKeys}
            setExpandedKeys={setExpandedKeys}
        />
      </>
  );
}