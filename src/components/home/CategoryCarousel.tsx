import {FC} from "react";
import Link from "next/link";
import clsx from "clsx";
import {GridTileImage} from "../theme/ui/grid/Tile";
import {NOT_IMAGE} from "@/utils/constants";
import {getCategoryPage} from "@utils/api/product";

interface CategoryCarouselProps {
  options: {
    filters: Record<string, string | number | boolean | undefined>;
  };
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
  return (
    <div
      className={
        size === 'full' ? 'col-span-1 xxs:col-span-2 order-2' : 'col-span-1'
      }
    >
      <Link
          aria-label={`Shop ${category.name} category`}
        className={clsx(
          "relative block h-full w-full aspect-[380/280]",
          size === "half" && "xxs:aspect-[182/280]"
        )}
          href={`/search/${category.name}`}
      >
        <GridTileImage
          fill
          alt={`${category.name} category image`}
          className="relative h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
          label={{
            position: "center",
            title: category.name || "",
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

const CategoryCarousel: FC<CategoryCarouselProps> = async ({
  options: _options,
}) => {
  const categories = await getCategoryPage({});

  // 安全处理 categories.data，确保即使数据不存在也不会报错
  const topCategories = categories.filter((category: any) => category.id !== "0")
      // .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
      .slice(1, 4);
  if (!topCategories.length) return null;

  return (
      <section className="pt-8 sm:pt-12 lg:pt-20">
        <div className="md:max-w-4.5xl mx-auto mb-10 w-auto text-center md:px-36">
          <h2 className="mb-2 text-xl md:text-4xl  font-semibold">
            Shop by Category
          </h2>
          <p className="text-sm md:text-base font-normal text-black/60 dark:text-neutral-300">
            Discover the latest trends! Fresh products just added—shop new
            styles, tech, and essentials before they&apos;re gone.
          </p>
        </div>
        <div className="w-full overflow-x-auto overflow-y-hidden">
          <div className="grid gap-4 grid-cols-1 xxs:grid-cols-2 lg:max-h-[calc(100vh-200px)] sm:hidden">
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
            {topCategories.map((category) => (
                <li
                    key={category.id}
                    className="relative aspect-498/665 h-full w-full max-w-[498px] flex-none overflow-hidden rounded-[18px]"
                >
                  <Link
                      className="relative h-full w-full"
                      href={`/search/${category.name}`}
                      aria-label={`Shop ${category.name} category`}
                  >
                    <GridTileImage
                        fill
                        alt={`${category.name} category image`}
                        className={
                          "relative rounded-[18px] overflow-hidden object-cover transition duration-300 ease-in-out group-hover:scale-105"
                        }
                        label={{
                          title: category.name || "",
                          page: "category",
                          amount: "0",
                          currencyCode: "USD",
                        }}
                        src={category.picUrl || NOT_IMAGE}
                    />
                  </Link>
                </li>
            ))}
          </ul>
        </div>
      </section>
  );
};

export default CategoryCarousel;