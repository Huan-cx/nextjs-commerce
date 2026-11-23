"use client";

import Link from "@/components/common/Link";
import {ThemeOptions} from "@/types/types";
import {isArray} from "@/utils/type-guards";
import {useLocale} from "next-intl";

const FooterMenuItem = ({ item }: { item: ThemeOptions }) => {
  const locale = useLocale();

  // 获取当前语言的翻译（精确匹配4位语言代码）
  const translation = item?.translations?.find(
      (t: any) => t.locale === locale
  );

  // 优先使用翻译的slug，否则使用默认的slug或title作为URL
  const slug = translation?.slug || item?.slug || item?.title;
  const url = `/${slug}`;

  // 优先使用翻译的标题，否则使用默认的title
  const displayTitle = translation?.title || item?.title;

  return (
    <li className="text-selected-black dark:text-neutral-300">
      <Link
          aria-label={`${displayTitle}`}
          title={`${displayTitle}`}
        className="block px-0 py-1 md:p-2 text-nowrap text-sm underline-offset-4 text-selected-black dark:text-neutral-300 hover:text-black hover:underline md:inline-block dark:hover:text-neutral-300"
          href={url}
      >
        {displayTitle}
      </Link>
    </li>
  );
};

export default function FooterMenu({
  menu,
}: {
  menu: any;
}) {
  if (!menu || menu.length === 0) return null;
  const firstMenu = menu;
  // const firstTranslation = firstMenu?.translations?.edges?.[0]?.node;
  // const channels = typeof firstTranslation?.options === 'string'
  //   ? safeParse(firstTranslation.options)
  //   : firstTranslation?.options;
  return (
    <div className="flex justify-between gap-x-8 lg:gap-x-[50px]">
      {/* Render columns 1 */}
      {isArray(firstMenu?.column_1) ? (
        <nav className="w-full lg:min-w-[160px] xl:min-w-[200px]">
          <ul>
            {firstMenu.column_1.map((item: ThemeOptions, index: number) => {
              return <FooterMenuItem key={index} item={item} />;
            })}
          </ul>
        </nav>
      ) : null}

      {/* Render columns 2 */}
      {isArray(firstMenu?.column_2) ? (
        <nav className="w-full lg:min-w-[160px] xl:min-w-[200px]">
          <ul>
            {firstMenu.column_2.map((item: ThemeOptions, index: number) => {
              return <FooterMenuItem key={index} item={item} />;
            })}
          </ul>
        </nav>
      ) : null}

      {/* Render columns 3 */}
      {isArray(firstMenu?.column_3) ? (
        <nav className="w-full lg:min-w-[160px] xl:min-w-[200px]">
          <ul>
            {firstMenu.column_3.map((item: ThemeOptions, index: number) => {
              return <FooterMenuItem key={index} item={item} />;
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}