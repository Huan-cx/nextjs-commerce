"use client";

import Link from "@/components/common/Link";
import MobileMenu from "./MobileMenu";
import {useQuery} from "@tanstack/react-query";
import {getCategoryPage} from "@utils/api/product";
import {useLocale, useTranslations} from "next-intl";
import {getTranslationName} from "@/utils/i18n/translation";

export function CategoriesMenu() {
  const t = useTranslations("navbar");
  const locale = useLocale();

  const {data: allCategories = []} = useQuery({
    queryKey: ['categories-menu'],
    queryFn: () => getCategoryPage({}),
  });

  const categories = allCategories.filter((cat: any) => cat.parentId === 0);

  const filteredCategories = categories
      .map((cat: any) => {
        // 使用国际化翻译获取分类名称
        const translatedName = getTranslationName(cat, locale, cat.name || "");
        return {
          id: cat.id,
          name: translatedName,
          slug: cat.slug || cat.name || "",
        };
      })
      .filter((item: any) => item.name && item.slug);

  const menuData = [
    {name: t("all"), slug: "", id: ""},
    ...filteredCategories.slice(0, 3),
  ];

  return (
      <>
        <MobileMenu menu={menuData}/>
        <ul className="hidden gap-4 text-sm md:items-center lg:flex xl:gap-6">
          {menuData.map(
              (item: { id: string; name: string; slug: string }) => (
                  <li key={item?.id + item?.name}>
                    <Link
                        className="text-nowrap relative text-neutral-500 before:absolute before:bottom-0 before:left-0 before:h-px before:w-0 before:bg-current before:transition-all before:duration-300 before:content-[''] hover:text-black hover:before:w-full dark:text-neutral-400 dark:hover:text-neutral-300"
                        href={item.slug ? `/category/${item.slug}` : "/search"}
                        prefetch={true}
                        aria-label={t("browseProducts", {name: item.name})}
                    >
                      {item.name}
                    </Link>
                  </li>
              )
          )}
        </ul>
      </>
  );
}