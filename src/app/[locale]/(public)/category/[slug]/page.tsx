import dynamicImport from "next/dynamic";
import Grid from "@/components/theme/ui/grid/Grid";
import NotFound from "@/components/theme/search/not-found";
import {isArray} from "@/utils/type-guards";
import {getCategoryBySlug, getSpuPage} from "@/utils/api/product";
import {generateMetadataForPage, getFilterAttributes,} from "@/utils/helper";
import SortOrder from "@/components/theme/filters/SortOrder";
import {SortByFields} from "@/utils/constants";
import MobileFilter from "@/components/theme/filters/MobileFilter";
import FilterList from "@/components/theme/filters/FilterList";
import {Metadata} from "next";
import {notFound} from "next/navigation";
import {getTranslationMetaDescription, getTranslationMetaTitle, getTranslationName} from "@/utils/i18n/translation";

const Pagination = dynamicImport(
    () => import("@/components/catalog/Pagination"),
);
const ProductGridItems = dynamicImport(
    () => import("@/components/catalog/product/ProductGridItems"),
);

export const dynamicParams = true;

export async function generateMetadata({
                                         params,
                                       }: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const {slug, locale} = await params;

  try {
    const category = await getCategoryBySlug({slug});
    if (!category) {
      return generateMetadataForPage("category", {
        title: slug,
        description: `Products in ${slug} category`,
        image: "/category-og.jpg",
      });
    }

    // 使用翻译后的名称和描述（使用当前语言locale）
    const translatedName = getTranslationName(category, locale, category.name || slug);
    const translatedMetaTitle = getTranslationMetaTitle(category, locale, translatedName);
    const translatedMetaDescription = getTranslationMetaDescription(category, locale, category.description || `Products in ${translatedName} category`);

    return generateMetadataForPage("category", {
      title: translatedMetaTitle,
      description: translatedMetaDescription,
      image: category.picUrl || "/category-og.jpg",
    });
  } catch (_error) {
    return generateMetadataForPage("category", {
      title: slug,
      description: `Products in ${slug} category`,
      image: "/category-og.jpg",
    });
  }
}

export default async function CategoryPage({
                                             params,
                                             searchParams,
                                           }: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const {slug, locale} = await params;
  const queryParams = await searchParams;

  // 获取分类信息
  const category = await getCategoryBySlug({slug});
  if (!category) {
    return notFound();
  }

  // 获取翻译后的分类名称
  const translatedCategoryName = getTranslationName(category, locale, category.name || slug);

  const {
    page,
  } = (queryParams || {}) as {
    [key: string]: string;
  };

  const itemsPerPage = 6;
  const currentPage = page ? parseInt(page) - 1 : 0;

  // 从 URL 获取排序参数
  const sortValue = (queryParams?.sort as string) || "newest";
  const selectedSort = SortByFields.find((s) => s.key === sortValue) || SortByFields[0];

  // 根据选择的排序配置构建 sortField 和 sortAsc
  let sortField = "id";
  let sortAsc = false;

  switch (selectedSort.sortKey) {
    case "createTime":
      sortField = "createTime";
      sortAsc = !selectedSort.reverse;
      break;
    case "price":
      sortField = "price";
      sortAsc = !selectedSort.reverse;
      break;
    default:
      sortField = "id";
      sortAsc = false;
  }

  // 获取分类下的商品
  const response = await getSpuPage({
    categoryId: category.id,
    sortField,
    sortAsc,
    pageSize: itemsPerPage,
    pageNo: currentPage + 1,
  });

  const filterAttributes = await getFilterAttributes();

  const products = response?.list || [];
  const totalCount = response?.total || 0;

  return (
      <>
        <h2 className="text-2xl sm:text-4xl font-semibold mx-auto mt-7.5 w-full max-w-screen-2xl my-3 mx-auto px-4 xss:px-7.5">
          {translatedCategoryName}
        </h2>

        <div
            className="my-10 hidden gap-4 md:flex md:items-baseline md:justify-between w-full mx-auto max-w-screen-2xl px-4 xss:px-7.5">
          <FilterList filterAttributes={filterAttributes}/>

          <SortOrder sortOrders={SortByFields} title="Sort by"/>
        </div>
        <div
            className="flex items-center justify-between gap-4 py-8 md:hidden  mx-auto w-full max-w-screen-2xl px-4 xss:px-7.5">
          <MobileFilter filterAttributes={filterAttributes}/>

          <SortOrder sortOrders={SortByFields} title="Sort by"/>
        </div>

        {!isArray(products) && (
            <NotFound
                msg={`There are no products in the ${translatedCategoryName} category`}
            />
        )}
        {isArray(products) ? (
            <Grid
                className="grid grid-flow-row grid-cols-2 gap-5 lg:gap-11.5 w-full max-w-screen-2xl mx-auto md:grid-cols-3 lg:grid-cols-4 px-4 xss:px-7.5">
              <ProductGridItems products={products}/>
            </Grid>
        ) : null}

        {isArray(products) && totalCount > itemsPerPage && (
            <nav
                aria-label="Collection pagination"
                className="my-10 block items-center sm:flex"
            >
              <Pagination
                  itemsPerPage={itemsPerPage}
                  itemsTotal={totalCount || 0}
                  currentPage={currentPage}
              />
            </nav>
        )}
      </>
  );
}