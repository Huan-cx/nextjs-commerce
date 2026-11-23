import RenderThemeCustomization from "@components/home/RenderThemeCustomization";
import {getHomeSections} from "@/utils/api/theme-customization";
import {normalizeSections} from "@/utils/theme/normalize";
import {DEFAULT_HOME_SECTIONS} from "@/config/home-default-sections";
import {generateMetadataForPage} from "@/utils/helper";
import {Metadata} from "next";
import {staticSeo} from "@/utils/metadata";

export const revalidate = 60;

export async function generateMetadata({
                                         params,
                                       }: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const {locale} = await params;
  return generateMetadataForPage("", staticSeo.default, locale);
}

export default async function Home({
                                     params,
                                   }: {
  params: Promise<{ locale: string }>;
}) {
  const {locale} = await params;

  let sections = DEFAULT_HOME_SECTIONS;
  try {
    const apiSections = await getHomeSections({pageCode: "home", themeCode: "default", locale});
    const normalized = normalizeSections(apiSections);
    if (normalized.length > 0) {
      sections = normalized;
    }
  } catch (err) {
    // 后端离线 / 超时 → 兜底 DEFAULT_HOME_SECTIONS
    console.warn("[page.tsx] API unavailable, using DEFAULT_HOME_SECTIONS. err:", err);
  }

  return <RenderThemeCustomization sections={sections} locale={locale}/>;
}
