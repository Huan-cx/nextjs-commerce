"use client";

import {FC} from "react";
import {ThreeItemGrid} from "./ThreeItemGrid";
import Theme from "./ProductCarouselTheme";
import type {ThemeProductBrief, ThemeSection} from "@/types/theme/theme-customization";

interface ProductCarouselProps {
  section: ThemeSection;
}

const ProductCarousel: FC<ProductCarouselProps> = ({section}) => {
  // ✅ 直接用后端已经填充好的商品数据 — 零额外请求
  const products: ThemeProductBrief[] = section.products ?? [];

  if (!products.length) return null;

  // ✅ 标题和副标题全部从 Admin 配置的 translation 取，没配时回落
  const title = section.translation?.title ?? section.name ?? "Products";
  const description = section.translation?.subtitle ?? null;
  const layout = section.layout;
  const isFeatured3 = layout === "featured3";

  // 将 ThemeProductBrief 适配 ThreeItemGrid / Theme 组件期望的 Spu 字段
  const spuLikeList = products.map((p) => ({
    id: p.id,
    name: p.name,
    picUrl: p.picUrl ?? "",
    price: p.price ?? 0,
    originalPrice: p.originalPrice,
    salesCount: p.salesCount ?? 0,
  }));

  if (isFeatured3) {
    return (
        <ThreeItemGrid
            title={title}
            description={description}
            products={spuLikeList.slice(0, 3)}
        />
    );
  }

  return (
      <Theme
          title={title}
          description={description}
          products={spuLikeList.slice(0, Math.min(products.length, 8))}
      />
  );
};

export default ProductCarousel;
