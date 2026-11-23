import OpenGraphImage from "@components/common/OpenGraphImage";


export default async function Image({params}: { params: Promise<{ page: string }> }) {
  // Next.js 15+ params 是 Promise 类型，必须先 await
  const resolvedParams = await params;

  // const page = await getPage({ urlKey: resolvedParams.page }) as { translation?: { metaTitle?: string; pageTitle?: string } }[];
  // const pageData = page && page.length > 0 ? page[0].translation : undefined;
  // const title = pageData?.metaTitle || pageData?.pageTitle;

  const title = resolvedParams.page || "test image";
  return await OpenGraphImage({title});
}
