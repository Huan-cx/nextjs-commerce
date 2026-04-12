import {notFound} from "next/navigation";
import Prose from "@components/theme/search/Prose";
import {getArticle} from "@utils/api/footer";


export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: pageParams } = await params;
  const page = await getArticle({title: pageParams});
  if (!page) return notFound();
  const pageData = page;

  return (
    <div className="my-4 flex flex-col justify-between p-4">
      <div className="flex flex-col gap-4 mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold">{pageData?.title}</h1>
        <Prose className="mb-8" html={pageData?.content}/>
      <p className="text-sm italic">
        {`This document was last updated on ${page.createTime}.`}
        {/*{`This document was last updated on ${new Intl.DateTimeFormat(
              undefined,
              {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
              },
          )?.format(new Date(pageDataArray?.[0]?.updatedAt || "---"))}.`}*/}
      </p>
      </div>
    </div>
  );
}
