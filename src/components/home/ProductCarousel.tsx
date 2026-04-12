import {FC} from "react";
import {ThreeItemGrid} from "./ThreeItemGrid";
import Theme from "./ProductCarouselTheme";
import {getSpuPage} from "@utils/api/product";


interface ProductCarouselProps {
  options: {
    title?: string;
    filters: Record<string, any>;
  };
  itemCount?: number;
  sortOrder?: number;
}

const ProductCarousel: FC<ProductCarouselProps> = async ({
                                                           options,
                                                           itemCount = 4,
                                                           sortOrder,
                                                         }) => {
  const { filters, title } = options;
  try {
    const { sort, limit, ...rest } = filters || {};
    const filterObject: Record<string, string> = {};
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        filterObject[key] = String(value);
      }
    });
    const filterInput =
        Object.keys(filterObject).length > 0
            ? filterObject
            : undefined;

    let sortAsc = false; // 默认降序

    if (sort === "created_at-desc") {
      sortAsc = false;
    } else if (sort === "price-desc") {
      sortAsc = false;
    }

    const data = await getSpuPage({
      ...filterInput,
      // sortField,
      sortAsc,
      pageSize: limit ? parseInt(limit, 10) : itemCount,
      pageNo: 1,
    });
    const products =
        data?.list?.slice(0, 8) || [];

    if (!products.length) {
      return null;
    }

    if (sortOrder === 2) {
      return (
          <ThreeItemGrid
              title={title || "Products"}
              description="Discover the latest trends! Fresh products just added—shop new styles, tech, and essentials before they're gone."
              products={products.slice(0, 3)}
          />
      );
    }

    return (
        <Theme
            title={title || "Products"}
            description="Discover the latest trends! Fresh products just added—shop new styles, tech, and essentials before they're gone."
            products={products}
        />
    );
  } catch (error) {
    console.error("Error fetching products for carousel:", {
      title,
      filters,
      error: error instanceof Error ? error.message : error,
    });
    return null;
  }
};

export default ProductCarousel;
