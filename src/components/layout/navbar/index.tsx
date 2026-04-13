import Link from "next/link";
import {Suspense} from "react";
import MobileMenu from "./MobileMenu";
import Search from "./Search";
import Cart from "@/components/cart";
import {SearchSkeleton} from "@/components/common/skeleton/SearchSkeleton";
import {IconSkeleton} from "@/components/common/skeleton/IconSkeleton";
import ThemeSwitcherWrapper from "@components/theme/theme-switch";
import LogoIcon from "@components/common/icons/LogoIcon";
import UserAccount from "@components/customer/credentials";
import {get} from "@utils/request/request";

export default async function Navbar() {
  // 调用接口获取所有分类
  const response = await get("product/category/list");

  const allCategories = response?.data || [];

  // 从所有分类中筛选出 parentId 为 1 的子分类
  const categories = allCategories.filter((cat: any) => cat.parentId === 0);

  const filteredCategories = categories
      .map((cat: any) => {
        return {
          id: cat.id,
          name: cat.name || "",
          // REST API 没有 slug，我们使用 name 作为 slug 的替代品
          slug: cat.name || "",
        };
      })
      .filter((item: any) => item.name && item.slug);

  const menuData = [
    {id: "all", name: "All", slug: ""},
    ...filteredCategories.slice(0, 3),
  ];

  return (
      <>
      <header className="sticky top-0 z-10">
        <nav className="relative flex flex-col items-center justify-between gap-4 bg-neutral-50 p-4 dark:bg-neutral-900 md:flex-row lg:px-6 lg:py-4">
          <div className="flex w-full items-center justify-between gap-0 sm:gap-4">
            <div className="flex max-w-fit gap-2 xl:gap-6">
              <Suspense fallback={null}>
                <MobileMenu menu={menuData}/>
              </Suspense>
              <Link
                className="flex h-9 w-full scale-95 items-center md:h-9 md:w-auto lg:h-10"
                href="/"
                aria-label="Go to homepage"
              >
                <LogoIcon />
              </Link>
              <ul className="hidden gap-4 text-sm md:items-center lg:flex xl:gap-6">
                {menuData.map(
                    (item: { id: string; name: string; slug: string }) => (
                        <li key={item?.id + item?.name}>
                          <Link
                              className="text-nowrap relative text-neutral-500 before:absolute before:bottom-0 before:left-0 before:h-px before:w-0 before:bg-current before:transition-all before:duration-300 before:content-[''] hover:text-black hover:before:w-full dark:text-neutral-400 dark:hover:text-neutral-300"
                              href={item.slug ? `/search/${item.slug}` : "/search"}
                              prefetch={true}
                              aria-label={`Browse ${item.name} products`}
                          >
                            {item.name}
                          </Link>
                        </li>
                    )
                )}
              </ul>
            </div>
            <div className="hidden flex-1 justify-center md:flex">
              <Suspense fallback={<SearchSkeleton />}>
                <Search search={false} />
              </Suspense>
            </div>
            <div className="flex max-w-fit gap-2 md:gap-4">
              <div className="flex">
                <ThemeSwitcherWrapper/>
              </div>
              <div className="hidden lg:block">
                <Cart/>
              </div>
              <Suspense fallback={<IconSkeleton/>}>
                <div className="hidden lg:block">
                  <UserAccount/>
                </div>
              </Suspense>
            </div>
          </div>
        </nav>
      </header>
      </>
  );
}