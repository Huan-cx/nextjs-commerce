import {notFound} from "next/navigation";
import React, {Suspense} from "react";
import {ProductDetailSkeleton, RelatedProductSkeleton,} from "@/components/common/skeleton/ProductSkeleton";
import {BASE_SCHEMA_URL, baseUrl, getImageUrl, NOT_IMAGE, PRODUCT_TYPE,} from "@/utils/constants";
import HeroCarousel from "@/components/common/slider/HeroCarousel";
import {isArray} from "@/utils/type-guards";
import ProductInfo from "@components/catalog/product/ProductInfo";
import {LRUCache} from "@/utils/LRUCache";
import {MobileSearchBar} from "@components/layout/navbar/MobileSearch";
import {HeroCarouselShimmer} from "@components/common/slider";
import {Spu} from "@/types/api/product/type";
import {getProductSpu} from "@utils/api/product";
import ProductTabs from "@components/catalog/product/ProductTabs";

const productCache = new LRUCache<Spu>(100, 3);
export const dynamic = "force-static";

async function getSingleProduct(urlKey: string) {
  const cachedProduct = productCache.get(urlKey);
  if (cachedProduct) {
    return cachedProduct;
  }

  try {
    const product = await getProductSpu({id: Number(urlKey)});
    if (product) {
      productCache.set(urlKey, product);
    }
    return product;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching product:", {
        message: error.message,
        urlKey,
        graphQLErrors: (error as unknown as Record<string, unknown>)
          .graphQLErrors,
      });
    }
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ urlProduct: string[] }>;
  searchParams: Promise<{ type: string }>;
}) {
  const { urlProduct } = await params;
  const fullPath = urlProduct.join("/");
  const product = await getSingleProduct(fullPath);
  if (!product) return notFound();

  const imageUrl = getImageUrl(product?.picUrl, baseUrl, NOT_IMAGE);
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
      <MobileSearchBar />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
        type="application/ld+json"
      />
      <div className="flex flex-col gap-y-4 rounded-lg pb-0 pt-4 sm:gap-y-6 md:py-7.5 lg:flex-row w-full max-w-screen-2xl mx-auto px-4 xss:px-7.5 lg:gap-8">
        <div className="h-full w-full max-w-[885px] max-1366:max-w-[650px] max-lg:max-w-full">
          <Suspense fallback={<HeroCarouselShimmer />}>
            {isArray(VariantImages) ? (
              <HeroCarousel
                images={
                    (VariantImages as unknown as [])?.map(
                    (image) => ({
                      src:
                          getImageUrl(image, baseUrl, NOT_IMAGE) ||
                        "",
                      altText: image || "",
                    }),
                  ) || []
                }
              />
            ) : (
              <HeroCarousel
                images={[
                  {
                    src: imageUrl || "",
                    altText: product?.name || "product image",
                  },
                ]}
              />
            )}
          </Suspense>
        </div>
        <div className="basis-full lg:basis-4/6">
          <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductInfo
                product={product as Spu}
              slug={fullPath}
            />
          </Suspense>
        </div>
      </div>
      <div className="w-full hidden lg:block ">
        <Suspense fallback={<RelatedProductSkeleton/>}>
          <ProductTabs product={product as Spu}/>
        </Suspense>
      </div>
      <Suspense fallback={<RelatedProductSkeleton />}>
        {/*<RelatedProductsSection fullPath={fullPath} />*/}
      </Suspense>
    </>
  );
}