"use client";

import {FC} from "react";
import Link from "@/components/common/Link";
import {GridTileImage} from "../theme/ui/grid/Tile";
import {NOT_IMAGE} from "@/utils/constants";
import type {ThemeSection} from "@/types/theme/theme-customization";

interface Props {
    section: ThemeSection;
}

interface MobileCategoryItemProps {
  category: any;
  size: "full" | "half";
  priority?: boolean;
}

const MobileCategoryItem: FC<MobileCategoryItemProps> = ({
  category,
  size,
  priority,
}) => {
    const categoryName = category.name || "";
  const categorySlug = category.slug;

  return (
    <div
      className={
          size === "full" ? "col-span-1 xxs:col-span-2 order-2" : "col-span-1"
      }
    >
      <Link
          aria-label={`Shop ${categoryName} category`}
          className="relative block h-full w-full aspect-[380/280]"
          href={`/category/${categorySlug}`}
      >
        <GridTileImage
          fill
          alt={`${categoryName} category image`}
          className="relative h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
          label={{
            position: "center",
            title: categoryName,
            page: "category",
            amount: "0",
            currencyCode: "USD",
          }}
          priority={priority}
          sizes={
            size === "full"
              ? "100vw"
              : "(min-width: 480px) 50vw, 100vw"
          }
          src={category.picUrl || NOT_IMAGE}
        />
      </Link>
    </div>
  );
};

const CategoryCarousel: FC<Props> = ({section}) => {
    // ✅ 直接用后端已经填充好的分类数据 — 零额外请求
    const topCategories = section.categories ?? [];

  if (!topCategories.length) return null;

    // ✅ 标题和副标题全部从 Admin 配置的 translation 取
    const title = section.translation?.title ?? section.name ?? "Categories";
    const subtitle = section.translation?.subtitle ?? null;

  return (
      <section className="pt-8 sm:pt-12 lg:pt-20">
          <div className="md:max-w-4.5xl mx-auto mb-10 w-auto text-center md:px-36">
              <h2 className="mb-2 text-xl md:text-4xl font-semibold">
                  {title}
              </h2>
              {subtitle && (
          <p className="text-sm md:text-base font-normal text-black/60 dark:text-neutral-300">
              {subtitle}
          </p>
              )}
          </div>
          <div className="w-full overflow-x-auto overflow-y-hidden">
              <div className="grid gap-4 grid-cols-1 xss:grid-cols-2 lg:max-h-[calc(100vh-200px)] sm:hidden">
                  {topCategories.length > 0 && (
                      <MobileCategoryItem
                          category={topCategories[0]}
                          size="half"
                          priority={true}
                      />
                  )}
                  {topCategories.length > 1 && (
                      <MobileCategoryItem
                          category={topCategories[1]}
                          size="full"
                          priority={true}
                      />
                  )}
                  {topCategories.length > 2 && (
                      <MobileCategoryItem
                          category={topCategories[2]}
                          size="half"
                      />
                  )}
              </div>

              <ul className="m-0 hidden grid-cols-1 gap-7 p-0 xxs:grid-cols-2 sm:grid sm:grid-cols-3">
                  {topCategories.map((category) => {
                      const categoryName = category.name || "";
                      const categorySlug = category.slug;
                      return (
                          <li
                              key={category.id}
                              className="relative aspect-498/665 h-full w-full max-w-[498px] flex-none overflow-hidden rounded-[18px]"
                          >
                              <Link
                                  className="relative h-full w-full"
                                  href={`/category/${categorySlug}`}
                                  aria-label={`Shop ${categoryName} category`}
                              >
                                  <GridTileImage
                                      fill
                                      alt={`${categoryName} category image`}
                                      className={
                                          "relative rounded-[18px] overflow-hidden object-cover transition duration-300 ease-in-out group-hover:scale-105"
                                      }
                                      label={{
                                          title: categoryName,
                                          page: "category",
                                          amount: "0",
                                          currencyCode: "USD",
                                      }}
                                      src={category.picUrl || NOT_IMAGE}
                                  />
                              </Link>
                          </li>
                      );
                  })}
              </ul>
          </div>
      </section>
  );
};

export default CategoryCarousel;
