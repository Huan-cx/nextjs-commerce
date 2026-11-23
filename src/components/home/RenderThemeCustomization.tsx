"use client";

import type {ThemeSection} from "@/types/theme/theme-customization";
import ImageCarousel from "./ImageCarousel";
import ProductCarousel from "./ProductCarousel";
import CategoryCarousel from "./CategoryCarousel";

interface Props {
  sections: ThemeSection[];
  locale: string;
}

const RenderThemeCustomization = ({sections, locale: _locale}: Props) => {
  if (!Array.isArray(sections) || sections.length === 0) {
    return null;
  }

  return (
      <section className="w-full max-w-screen-2xl mx-auto pb-4 px-4 xss:px-7.5">
        {sections.map((section) => {
          const key = `${section.id}-${section.type}`;

          switch (section.type) {
            case "image_carousel":
              return (
                  <ImageCarousel
                      key={key}
                      banners={section.banners ?? []}
                      sectionTitle={section.translation?.title ?? null}
                      sectionSubtitle={section.translation?.subtitle ?? null}
                  />
              );

            case "product_carousel":
              return (
                  <ProductCarousel
                      key={key}
                      section={section}
                  />
              );

            case "category_carousel":
              return (
                  <CategoryCarousel
                      key={key}
                      section={section}
                  />
              );

            case "static_content":
              // 二期接入前端渲染，暂时跳过
              return null;

            default:
              return null;
          }
        })}
      </section>
  );
};

export default RenderThemeCustomization;