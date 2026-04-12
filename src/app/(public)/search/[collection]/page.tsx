import {Metadata} from "next";
import {notFound} from "next/navigation";
import {isArray} from "@/utils/type-guards";
import Grid from "@components/theme/ui/grid/Grid";
import FilterList from "@components/theme/filters/FilterList";
import SortOrder from "@components/theme/filters/SortOrder";
import MobileFilter from "@components/theme/filters/MobileFilter";
import ProductGridItems from "@components/catalog/product/ProductGridItems";
import Pagination from "@components/catalog/Pagination";
import {getCategoryTree, getSpuPage} from "@/utils/api/product";
import {SortByFields} from "@utils/constants";
import {CategoryDetail} from "@components/theme/search/CategoryDetail";
import {Suspense} from "react";
import FilterListSkeleton from "@components/common/skeleton/FilterSkeleton";
import {MobileSearchBar} from "@components/layout/navbar/MobileSearch";
import {buildProductFilters, extractNumericId, findCategoryBySlug, getFilterAttributes} from "@utils/helper";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection: categorySlug } = await params;

  // 使用新的REST API获取分类树
  const categories = await getCategoryTree();
  const categoryItem = findCategoryBySlug(categories, categorySlug);

  if (!categoryItem) return notFound();

  return {
    title: categoryItem.name,
    description: categoryItem.description || `${categoryItem.name} products`,
  };
}

export default async function CategoryPage({
  searchParams,
  params,
}: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { collection: categorySlug } = await params;
  const resolvedParams = await searchParams;

  // 使用新的REST API获取分类树和筛选属性
  const [categories, filterAttributes] = await Promise.all([
    getCategoryTree(),
    getFilterAttributes(),
  ]);

  const categoryItem = findCategoryBySlug(categories, categorySlug);

  if (!categoryItem) return notFound();

  const numericId = extractNumericId(String(categoryItem.id));

  const {
    q: searchValue,
    page,
    sort: sortValue,
  } = (resolvedParams || {}) as {
    [key: string]: string;
  };

  const itemsPerPage = 12;
  const currentPage = page ? parseInt(page) - 1 : 0;

  const { filterObject: baseFilterObject } = buildProductFilters(resolvedParams || {});

  const filterObject: Record<string, string> = {
    ...baseFilterObject,
  };

  if (numericId) {
    filterObject.category_id = numericId;
  }

  // 根据 sort 参数构建排序字段
  const selectedSort = SortByFields.find((s) => s.key === (sortValue || "newest")) || SortByFields[0];
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

  // 使用新的REST API获取数据
  const response = await getSpuPage({
    keyword: searchValue,

    // filter: filterObject,
    sortField,
    sortAsc,
    pageSize: itemsPerPage,
    pageNo: currentPage + 1,
  });

  const products = response?.list || [];
  const totalCount = response?.total || 0;
  // const translation = categoryItem.translation;

  return (
    <>
      <MobileSearchBar />
      <section>
        <Suspense fallback={<FilterListSkeleton />}>
          <CategoryDetail
              categoryItem={{
                description: categoryItem.description ?? "",
                name: categoryItem.name ?? ""
              }}
          />
        </Suspense>
        <div className="my-10 hidden gap-4 md:flex md:items-baseline md:justify-between w-full max-w-screen-2xl mx-auto px-4">
          <FilterList filterAttributes={filterAttributes} />
          <SortOrder sortOrders={SortByFields} title="Sort by" />
        </div>
        <div className="flex items-center justify-between gap-4 py-8 md:hidden w-full max-w-screen-2xl mx-auto px-4">
          <MobileFilter filterAttributes={filterAttributes} />
          <SortOrder sortOrders={SortByFields} title="Sort by" />
        </div>

        {isArray(products) && products.length > 0 ? (
         <Grid
                   className="grid grid-flow-row grid-cols-2 gap-5 lg:gap-11.5 w-full max-w-screen-2xl mx-auto md:grid-cols-3 lg:grid-cols-4 px-4 xss:px-7.5"
                 >
            <ProductGridItems products={products} />
          </Grid>
        ) : (
          <div className="px-4">
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-neutral-300">
              <p className="text-neutral-500">No products found in this category.</p>
            </div>
          </div>
        )}

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
      </section>
    </>
  );
}