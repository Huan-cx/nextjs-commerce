import dynamicImport from "next/dynamic";
import Grid from "@/components/theme/ui/grid/Grid";
import NotFound from "@/components/theme/search/not-found";
import {isArray} from "@/utils/type-guards";
import {getSpuPage} from "@/utils/api/product";
import {generateMetadataForPage, getFilterAttributes,} from "@/utils/helper";
import SortOrder from "@/components/theme/filters/SortOrder";
import {SortByFields} from "@/utils/constants";
import MobileFilter from "@/components/theme/filters/MobileFilter";
import FilterList from "@/components/theme/filters/FilterList";
import {MobileSearchBar} from "@components/layout/navbar/MobileSearch";
import {Metadata} from "next";

const Pagination = dynamicImport(
  () => import("@/components/catalog/Pagination"),
);
const ProductGridItems = dynamicImport(
  () => import("@/components/catalog/product/ProductGridItems"),
);

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const itemsPerPage = 12;
    const commonSearches = [""];
    const params = [];
    for (const query of commonSearches) {
      // 使用 getSpuPage 获取商品列表和总数量
      const response = await getSpuPage({
        pageNo: 1,
        pageSize: 1,
        keyword: query,
        sortField: "createTime",
        sortAsc: false,
      });

      const totalCount = response.total || 0;
      const totalPages = Math.ceil(totalCount / itemsPerPage);

      for (let i = 0; i < totalPages; i++) {
        const pageParams: { page: string } = {
          page: String(i + 1),
        };
        params.push(pageParams);
      }
    }

    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const searchQuery = params?.q as string | undefined;

  return generateMetadataForPage("search", {
    title: searchQuery ? `Search: ${searchQuery}` : "Search Products",
    description: searchQuery
      ? `Search results for "${searchQuery}"`
      : "Search for products in our store",
    image: "/search-og.jpg",
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const {
    q: searchValue,
    page,
  } = (params || {}) as {
    [key: string]: string;
  };

  const itemsPerPage = 6;
  const currentPage = page ? parseInt(page) - 1 : 0;

  // 从 URL 获取排序参数（使用 sort 参数，如 "newest", "price-asc"）
  const sortValue = (params?.sort as string) || "newest";
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

  // TODO: 构建筛选参数
  // const { filterInput, isFilterApplied } = buildProductFilters(params || {});

  const response = await getSpuPage({
    keyword: searchValue,
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
      <MobileSearchBar />
      <h2 className="text-2xl sm:text-4xl font-semibold mx-auto mt-7.5 w-full max-w-screen-2xl my-3 mx-auto px-4 xss:px-7.5">
        All Top Products
      </h2>

      <div className="my-10 hidden gap-4 md:flex md:items-baseline md:justify-between w-full mx-auto max-w-screen-2xl px-4 xss:px-7.5">
        <FilterList filterAttributes={filterAttributes} />

        <SortOrder sortOrders={SortByFields} title="Sort by" />
      </div>
      <div className="flex items-center justify-between gap-4 py-8 md:hidden  mx-auto w-full max-w-screen-2xl px-4 xss:px-7.5">
        <MobileFilter filterAttributes={filterAttributes} />

        <SortOrder sortOrders={SortByFields} title="Sort by" />
      </div>

      {!isArray(products) && (
        <NotFound
          msg={`${
            searchValue
              ? `There are no products that match Showing : ${searchValue}`
              : "There are no products that match Showing"
          } `}
        />
      )}
      {isArray(products) ? (
        <Grid className="grid grid-flow-row grid-cols-2 gap-5 lg:gap-11.5 w-full max-w-screen-2xl mx-auto md:grid-cols-3 lg:grid-cols-4 px-4 xss:px-7.5">
          <ProductGridItems products={products} />
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