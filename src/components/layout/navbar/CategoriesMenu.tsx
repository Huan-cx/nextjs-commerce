"use client";

import MobileMenu from "./MobileMenu";
import {useQuery} from "@tanstack/react-query";
import {getCategoryPage} from "@utils/api/product";
import {useLocale, useTranslations} from "next-intl";
import {getTranslationName} from "@/utils/i18n/translation";
import MegaMenu from "./MegaMenu";

export function CategoriesMenu() {
  const t = useTranslations("navbar");
  const locale = useLocale();

  const {data: allCategories = []} = useQuery({
    queryKey: ['categories-menu'],
    queryFn: () => getCategoryPage({}),
  });

  // 应用国际化翻译到所有分类数据
  const translatedCategories = allCategories.map((cat: any) => ({
    ...cat,
    name: getTranslationName(cat, locale, cat.name || ""),
    children: cat.children?.map((subCat: any) => ({
      ...subCat,
      name: getTranslationName(subCat, locale, subCat.name || ""),
      children: subCat.children?.map((thirdCat: any) => ({
        ...thirdCat,
        name: getTranslationName(thirdCat, locale, thirdCat.name || "")
      }))
    }))
  }));
  translatedCategories
      .map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug || cat.name || "",
      }))
      .filter((item: any) => item.name && item.slug);
  t("all");
  return (
      <>
        {/* 对于移动设备和平板设备，使用移动端菜单 */}
        <div className="lg:hidden">
          <MobileMenu menu={translatedCategories}/>
        </div>

        {/* 对于桌面设备，使用新的巨型菜单 */}
        <div className="hidden lg:block">
          <MegaMenu template="enhanced-b2b" categories={translatedCategories}/>
        </div>
      </>
  );
}