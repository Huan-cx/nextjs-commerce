import {BASE_URL, SITE_CONFIG} from "./constants";
import {routing} from "@/i18n/routing";

const SCHEMA_URL = "https://schema.org";

function toAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
}

export function buildProductJsonLd(product: any) {
  if (!product) return null;

  const images: string[] = [];
  if (product.picUrl) images.push(toAbsoluteUrl(product.picUrl));
  if (Array.isArray(product.sliderPicUrls)) {
    images.push(
        ...product.sliderPicUrls
            .filter((u: string) => u && u !== product.picUrl)
            .map((u: string) => toAbsoluteUrl(u)),
    );
  }

  const offers = buildOffers(product);

  const jsonLd: Record<string, any> = {
    "@context": SCHEMA_URL,
    "@type": "Product",
    name: product.name,
    description: product.introduction || product.description,
    image: images.length > 0 ? images : undefined,
    sku: product.skuCode || (product.id ? String(product.id) : undefined),
    offers,
  };

  if (product.brandId) {
    jsonLd.brand = {
      "@type": "Brand",
      name: `Brand ${product.brandId}`,
    };
  }

  if (product.createTime) {
    jsonLd.releaseDate = new Date(product.createTime).toISOString();
  }

  return jsonLd;
}

function buildOffers(product: any) {
  const price = product.price ?? 0;
  const stock = product.stock ?? 0;
  const currency = SITE_CONFIG.currency;

  const offerItems: any[] = [];

  if (product.skus && product.skus.length > 0) {
    for (const sku of product.skus) {
      offerItems.push({
        "@type": "Offer",
        sku: sku.skuCode || String(sku.id || ""),
        price: (sku.price ?? price) / 100,
        priceCurrency: currency,
        availability: (sku.stock ?? 0) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
      });
    }
  } else {
    offerItems.push({
      "@type": "Offer",
      sku: product.id ? String(product.id) : undefined,
      price: price / 100,
      priceCurrency: currency,
      availability: stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    });
  }

  const prices = offerItems.map((o: any) => o.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return {
    "@type": "AggregateOffer",
    priceCurrency: currency,
    lowPrice: minPrice,
    highPrice: maxPrice,
    offerCount: offerItems.length,
    availability: stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    offers: offerItems,
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  if (!items || items.length === 0) return null;

  return {
    "@context": SCHEMA_URL,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildOrganizationJsonLd() {
  const url = BASE_URL || "https://nextjs.ruoyi.com";
  return {
    "@context": SCHEMA_URL,
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url,
    logo: {
      "@type": "ImageObject",
      url: toAbsoluteUrl("/Logo.webp"),
    },
    sameAs: [],
  };
}

export function buildWebSiteJsonLd() {
  const url = BASE_URL || "https://nextjs.ruoyi.com";
  return {
    "@context": SCHEMA_URL,
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url,
    inLanguage: routing.locales,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
        "inLanguage": routing.locales,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
