"use client";

import {useRef} from "react";
import {useRouter} from "@/i18n/routing";
import {getSpuPage} from "@utils/api/product";
import {DIRECT_TO_PRODUCT_ENABLED} from "@/utils/constants";
import type {Category} from "@/types/api/product/type";

/**
 * 分类跳转 Hook（三级分类）
 * 启用直达产品（DIRECT_TO_PRODUCT_ENABLED = true）时：点击分类加载其商品列表，
 * 仅有一个在售商品则直接跳转商品详情页，否则回退到常规分类页跳转。
 * 接口异常时同样回退分类页，保证导航可用性。跳转解析期间忽略重复点击，避免并发请求与重复导航。
 */
export function useCategoryDirectNavigation() {
  const router = useRouter();
  const navigatingRef = useRef(false);

  const navigateToCategory = async (category: Category, fallbackHref: string) => {
    // 未启用直达产品（或缺少分类 id）→ 常规跳转
    if (!DIRECT_TO_PRODUCT_ENABLED || !category.id) {
      router.push(fallbackHref);
      return;
    }

    // 防重复点击：上一个跳转解析未完成时忽略本次点击
    if (navigatingRef.current) {
      return;
    }
    navigatingRef.current = true;

    try {
      const pageResult = await getSpuPage({
        categoryId: category.id,
        pageNo: 1,
        pageSize: 1,
      });
      // 仅一个在售商品 → 直达商品详情页（优先使用 slug，缺失时用 id）
      if (pageResult?.total === 1 && pageResult.list?.[0]) {
        const spu = pageResult.list[0];
        router.push(`/product/${spu.slug || spu.id}`);
        return;
      }
    } catch (error) {
      console.error("[CategoryDirectNavigation] 分类商品加载失败，回退分类页:", error);
    } finally {
      navigatingRef.current = false;
    }

    router.push(fallbackHref);
  };

  return {navigateToCategory};
}
