import OpenGraphImage from "@components/common/OpenGraphImage";


export default async function Image({ params }: { params: { page: string } }) {
  // const page = await getPage({ urlKey: params.page }) as { translation?: { metaTitle?: string; pageTitle?: string } }[];
  // const pageData = page && page.length > 0 ? page[0].translation : undefined;
  // const title = pageData?.metaTitle || pageData?.pageTitle;
  console.log(params)
  const title = params.page || "test image";
  return await OpenGraphImage({ title });
}
