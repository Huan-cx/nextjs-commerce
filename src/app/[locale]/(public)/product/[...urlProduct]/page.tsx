import {notFound} from "next/navigation";
import React, {Suspense} from "react";
import {ProductDetailSkeleton, RelatedProductSkeleton,} from "@components/common/skeleton/ProductSkeleton";
import {BASE_SCHEMA_URL, PRODUCT_TYPE,} from "@/utils/constants";
import {MobileSearchBar} from "@components/layout/navbar/MobileSearch";
import {Spu} from "@/types/api/product/type";

import ProductTabs from "@components/catalog/product/ProductTabs";
import {generateMetadataForPage} from "@/utils/helper";
import {getTranslationMetaDescription, getTranslationMetaTitle} from "@/utils/i18n/translation";
import {Metadata} from "next";
import {ProductGalleryProvider} from "@components/catalog/product/ProductGalleryContext";
import {ProductGallery} from "@components/catalog/product/ProductGallery";
import {HeroCarouselShimmer} from "@components/common/slider";
import ProductInfo from "@components/catalog/product/ProductInfo";

import {cachedRestGet} from "@/utils/request/useCahceRest";

// 页面级缓存时间（5分钟）
export const revalidate = 300;

async function getSingleProduct(urlKey: string) {
  try {
    const isNumeric = /^\d+$/.test(urlKey);
    let product: Spu | null;

    if (isNumeric) {
      product = await cachedRestGet<Spu>("product", `product/spu/get-detail?id=${Number(urlKey)}`);
    } else {
      product = await cachedRestGet<Spu>("product", `product/spu/get-detail-by-slug?slug=${urlKey}`);
    }
    
    return product;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching product:", {
        message: error.message,
        urlKey,
      });
    }
    return null;
  }
}

export async function generateMetadata({
                                         params,
                                       }: {
  params: Promise<{ urlProduct: string[], locale: string }>;
}): Promise<Metadata> {
  const {urlProduct, locale} = await params;
  const fullPath = urlProduct.join("/");
  const product = await getSingleProduct(fullPath);

  const metaTitle = product ? getTranslationMetaTitle(product, locale, product.name || "Product") : "Product";
  const metaDescription = product ? getTranslationMetaDescription(product, locale, product.introduction || "") : undefined;

  return generateMetadataForPage(`product/${fullPath}`, {
    title: metaTitle,
    description: metaDescription,
    image: product?.picUrl,
    canonical: `/product/${fullPath}`,
  });
}

export default async function ProductPage({
                                            params,
                                          }: {
  params: Promise<{ urlProduct: string[], locale: string }>;
  searchParams: Promise<{ type: string }>;
}) {
  const {urlProduct, locale} = await params;
  const fullPath = urlProduct.join("/");
  const product = await getSingleProduct(fullPath);
  if (!product) return notFound();

  const productJsonLd = {
    "@context": BASE_SCHEMA_URL,
    "@type": PRODUCT_TYPE,
    name: product?.name,
    description: product?.description,
    skus: product?.skus,
  };

  const VariantImages = product?.sliderPicUrls;
  return (
      <>
        <MobileSearchBar/>
        <script
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(productJsonLd),
            }}
            type="application/ld+json"
        />
        <ProductGalleryProvider product={product as Spu} sliderPicUrls={VariantImages || []}>
          <div
              className="flex flex-col gap-y-4 rounded-lg pb-0 pt-4 sm:gap-y-6 md:py-7.5 lg:flex-row w-full max-w-screen-2xl mx-auto px-4 xss:px-7.5 lg:gap-8">
            <div className="h-full w-full max-w-[885px] max-1366:max-w-[650px] max-lg:max-w-full">
              <Suspense fallback={<HeroCarouselShimmer/>}>
                <ProductGallery/>
              </Suspense>
            </div>
            <div className="basis-full lg:basis-4/6">
              <Suspense fallback={<ProductDetailSkeleton/>}>
                <ProductInfo
                    product={product as Spu}
                    locale={locale}
                />
              </Suspense>
            </div>
          </div>
        </ProductGalleryProvider>
        <div className="w-full hidden lg:block ">
          <Suspense fallback={<RelatedProductSkeleton/>}>
            <ProductTabs product={product as Spu}/>
          </Suspense>
        </div>
        <Suspense fallback={<RelatedProductSkeleton/>}>
        </Suspense>
      </>
  );
}