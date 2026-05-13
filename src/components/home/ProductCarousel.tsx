"use client"

import {FC, useMemo} from "react";
import {ThreeItemGrid} from "./ThreeItemGrid";
import Theme from "./ProductCarouselTheme";
import {useQuery} from "@tanstack/react-query";
import {getSpuPage} from "@utils/api/product";
import {Spu} from "@/types/api/product/type";
import {useTranslations} from "next-intl";


interface ProductCarouselProps {
  options: {
    title?: string;
    filters: Record<string, any>;
  };
  itemCount?: number;
  sortOrder?: number;
}

const ProductCarousel: FC<ProductCarouselProps> = ({
                                                     options,
                                                     itemCount = 4,
                                                     sortOrder,
                                                   }) => {
  const { filters, title } = options;
  const t = useTranslations("home");

  // 构建查询参数
  const queryKey = useMemo(() => {
    return ['product-carousel', filters, itemCount, sortOrder];
  }, [filters, itemCount, sortOrder]);

  const filterInput = useMemo(() => {
    const { sort, limit, ...rest } = filters || {};
    const filterObject: Record<string, string> = {};
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        filterObject[key] = String(value);
      }
    });
    return Object.keys(filterObject).length > 0 ? filterObject : undefined;
  }, [filters]);

  const sortAsc = useMemo(() => {
    const {sort} = filters || {};
    if (sort === "created_at-asc" || sort === "price-asc") {
      return true;
    }
    return false; // 默认降序
  }, [filters]);

  const pageSize = useMemo(() => {
    const {limit} = filters || {};
    return limit ? parseInt(limit, 10) : itemCount;
  }, [filters, itemCount]);

  // 使用React Query获取数据
  const {data: spuPage, isLoading} = useQuery<{ list: Spu[] }>({
    queryKey,
    queryFn: async () => {
      const data = await getSpuPage({
        ...filterInput,
        sortAsc,
        pageSize,
        pageNo: 1,
      });
      return data || {list: []};
    },
    placeholderData: {list: []},
  });

  const products = useMemo(() => {
    return spuPage?.list?.slice(0, 8) || [];
  }, [spuPage]);

  // 加载状态不显示任何内容
  if (isLoading) {
    return null;
  }

  if (!products.length) {
    return null;
  }

  if (sortOrder === 2) {
    return (
        <ThreeItemGrid
            title={title || "Products"}
            description={t("productCarouselDescription")}
            products={products.slice(0, 3)}
        />
    );
  }

  return (
      <Theme
          title={title || "Products"}
          description={t("productCarouselDescription")}
          products={products}
      />
  );
};

export default ProductCarousel;