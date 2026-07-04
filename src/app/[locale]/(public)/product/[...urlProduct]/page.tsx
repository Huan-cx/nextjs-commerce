import {notFound} from "next/navigation";
import React, {Suspense} from "react";
import {ProductDetailSkeleton, RelatedProductSkeleton,} from "@/components/common/skeleton/ProductSkeleton";
import {BASE_SCHEMA_URL, PRODUCT_TYPE,} from "@/utils/constants";
import {MobileSearchBar} from "@components/layout/navbar/MobileSearch";
import {Spu} from "@/types/api/product/type";
import {getProductSpu, getProductSpuBySlug} from "@utils/api/product";
import ProductTabs from "@components/catalog/product/ProductTabs";
import {generateMetadataForPage} from "@/utils/helper";
import {getTranslationMetaDescription, getTranslationMetaTitle} from "@/utils/i18n/translation";
import {Metadata} from "next";
import {ProductGalleryProvider} from "@/components/catalog/product/ProductGalleryContext";
import {ProductGallery} from "@/components/catalog/product/ProductGallery";
import {HeroCarouselShimmer} from "@components/common/slider";
import {LRUCache} from "@/utils/LRUCache";
import ProductInfo from "@components/catalog/product/ProductInfo";

const productCache = new LRUCache<Spu>(100, 3);
export const dynamic = "force-static";

async function getSingleProduct(urlKey: string) {
  const cachedProduct = productCache.get(urlKey);
  if (cachedProduct) {
    return cachedProduct;
  }

  try {
    // 判断是ID还是slug
    const isNumeric = /^\d+$/.test(urlKey);
    let product: Spu | null;

    if (isNumeric) {
      // 如果是数字，使用ID获取
      product = await getProductSpu({id: Number(urlKey)});
    } else {
      // 如果不是数字，使用slug获取
      product = await getProductSpuBySlug({slug: urlKey});
    }
    
    if (product) {
      productCache.set(urlKey, product);
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
}): Promise<Metadata> {  // ← 添加这个返回类型
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
          {/* TODO 相关商品 */}
          {/*<RelatedProductsSection fullPath={fullPath} />*/}
        </Suspense>
      </>
  );
}