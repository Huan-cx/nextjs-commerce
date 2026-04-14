import Link from "next/link";
import MobileMenu from "./MobileMenu";
import {get} from "@utils/request/request";

export async function CategoriesMenu() {
  // 调用接口获取所有分类
  const response = await get("product/category/list");

  const allCategories = response || [];

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
    {name: "All", slug: ""},
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
                        href={item.id ? `/search/${item.id}` : "/search"}
                        prefetch={true}
                        aria-label={`Browse ${item.name} products`}
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