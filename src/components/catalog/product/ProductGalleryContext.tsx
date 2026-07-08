"use client";

import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {useSearchParams} from "next/navigation";
import {Spu} from "@/types/api/product/type";
import {getVariantInfo} from "@/utils/hooks/useProductVariant";
import {baseUrl, getImageUrl, NOT_IMAGE} from "@/utils/constants";

interface ProductGalleryContextType {
  images: { src: string; altText: string }[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

const ProductGalleryContext = createContext<ProductGalleryContextType | null>(null);

/**
 * 从 URL 参数中获取已选属性，查找匹配的 SKU
 */
function findSelectedSkuByParams(product: Spu, searchParamsStr: string): any | null {
  if (!product.skus || product.skus.length === 0) return null;

  // 调试：打印 URL 参数
  console.log("[ProductGallery] 查找 SKU，参数:", searchParamsStr);

  const variantInfo = getVariantInfo(product, searchParamsStr);
  const skuId = variantInfo?.productid;

  console.log("[ProductGallery] 计算得到 SKU ID:", skuId, "已选属性:", variantInfo?.selectedAttributes);

  if (!skuId) return null;

  const sku = product.skus.find((s) => s.id === Number(skuId)) || null;

  console.log("[ProductGallery] 找到 SKU:", sku?.name, "图片:", sku?.picUrl);

  return sku;
}

export function ProductGalleryProvider({
                                         product,
                                         sliderPicUrls,
                                         children,
                                       }: {
  product: Spu;
  sliderPicUrls: string[];
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();

  const baseImages = useMemo(() => {
    if (Array.isArray(sliderPicUrls) && sliderPicUrls.length > 0) {
      return sliderPicUrls.map((image) => ({
        src: getImageUrl(image, baseUrl, NOT_IMAGE) || "",
        altText: product.name || "product image",
      }));
    }
    const coverImage = getImageUrl(product.picUrl, baseUrl, NOT_IMAGE) || "";
    return [{src: coverImage, altText: product.name || "product image"}];
  }, [sliderPicUrls, product.picUrl, product.name]);

  const selectedSku = useMemo(
      () => findSelectedSkuByParams(product, searchParams.toString()),
      [product, searchParams]
  );

  const skuImageUrl = useMemo(() => {
    if (!selectedSku?.picUrl) return null;
    const url = getImageUrl(selectedSku.picUrl, baseUrl, NOT_IMAGE) || "";
    return url || null;
  }, [selectedSku]);

  const [userSelectedIndex, setUserSelectedIndex] = useState<number | null>(null);
  const lastSkuIdRef = useRef<number | null>(null);

  const {images, skuIndex, currentSkuId} = useMemo(() => {
    if (!skuImageUrl) {
      return {images: baseImages, skuIndex: -1, currentSkuId: null};
    }

    const existingIndex = baseImages.findIndex((img) => img.src === skuImageUrl);
    if (existingIndex >= 0) {
      return {images: baseImages, skuIndex: existingIndex, currentSkuId: selectedSku?.id || null};
    }

    const newImage = {src: skuImageUrl, altText: product.name || "product variant"};
    return {images: [...baseImages, newImage], skuIndex: baseImages.length, currentSkuId: selectedSku?.id || null};
  }, [baseImages, skuImageUrl, product.name, selectedSku]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (currentSkuId !== lastSkuIdRef.current) {
      lastSkuIdRef.current = currentSkuId;
      setUserSelectedIndex(null);
    }
  }, [currentSkuId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const currentIndex = useMemo(() => {
    if (userSelectedIndex !== null && userSelectedIndex < images.length) {
      return userSelectedIndex;
    }
    if (skuIndex >= 0) {
      return skuIndex;
    }
    return 0;
  }, [userSelectedIndex, skuIndex, images.length]);

  const setCurrentIndex = useCallback((index: number) => {
    setUserSelectedIndex(index);
  }, []);

  const value = useMemo(
      () => ({
        images,
        currentIndex,
        setCurrentIndex,
      }),
      [images, currentIndex, setCurrentIndex]
  );

  return (
      <ProductGalleryContext.Provider value={value}>
        {children}
      </ProductGalleryContext.Provider>
  );
}

export function useProductGallery() {
  const context = useContext(ProductGalleryContext);
  if (!context) {
    throw new Error("useProductGallery must be used within a ProductGalleryProvider");
  }
  return context;
}
