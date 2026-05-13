import {notFound} from "next/navigation";
import Prose from "@components/theme/search/Prose";
import {getArticle, getArticleBySlug, incrementArticleView} from "@utils/api/footer";
import {generateMetadataForPage} from "@/utils/helper";
import {getTranslationMetaDescription, getTranslationMetaTitle} from "@/utils/i18n/translation";
import {Metadata} from "next";


async function getPageContent(pageKey: string) {
  try {
    // 先尝试通过slug获取文章
    const articleBySlug = await getArticleBySlug({slug: pageKey});
    if (articleBySlug) {
      return articleBySlug;
    }
  } catch (_error) {
    console.log("No article found by slug, trying by title");
  }

  // 如果通过slug获取不到，再尝试通过title获取
  return await getArticle({title: pageKey});
}

export async function generateMetadata({
                                         params,
                                       }: {
  params: Promise<{ page: string; locale: string }>;
}): Promise<Metadata> {
  // params是Promise，需要await
  const {page, locale} = await params;
  const pageContent = await getPageContent(page);

  // 使用翻译后的SEO字段
  const metaTitle = pageContent ? getTranslationMetaTitle(pageContent, locale, pageContent.title || "Page") : "Page";
  const metaDescription = pageContent ? getTranslationMetaDescription(pageContent, locale, pageContent.introduction || "") : undefined;

  return generateMetadataForPage(page, {
    title: metaTitle,
    description: metaDescription,
    image: pageContent?.picUrl,
    canonical: `/${page}`,
  });
}


export default async function Page({
                                     params,
                                   }: {
  params: Promise<{ page: string }>;
}) {
  const {page: pageParams} = await params;
  const page = await getPageContent(pageParams);
  if (!page) return notFound();

  // 异步增加浏览量（不等待结果）
  incrementArticleView({id: page.id}).catch(console.error);
  
  const pageData = page;

  return (
      <div className="my-4 flex flex-col justify-between p-4">
        <div className="flex flex-col gap-4 mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold">{pageData?.metaTitle || pageData?.title}</h1>
          {pageData?.picUrl && (
              <img
                  src={pageData.picUrl}
                  alt={pageData.title}
                  className="w-full h-auto rounded-lg mb-4"
              />
          )}
          <Prose className="mb-8" html={pageData?.content}/>
          <p className="text-sm italic">
            {`This document was last updated on ${page.createTime}.`}
          </p>
        </div>
      </div>
  );
}