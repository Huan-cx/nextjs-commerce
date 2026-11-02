"use client";

import {Tab, Tabs} from "@heroui/react";
import {Spu} from "@/types/api/product/type";
import Prose from "@components/theme/search/Prose";
import React from "react";
import {useTranslations} from "next-intl";
import {useTranslationData} from "@/hooks/useTranslationData";


export default function ProductTabs({product}: { product: Spu }) {
  const t = useTranslations("product");
  const {getDescription} = useTranslationData();
  const description = getDescription(product, product.description || "");
  
  return (
      <div className="w-full mt-16 bg-neutral-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs
              aria-label={t("details")}
              variant="underlined"
              size="lg"
              color="secondary"
              fullWidth={true}
              classNames={{
                base: "w-full",
                tabList: "p-1.5 max-w-md mx-auto bg-transparent rounded-md",
                cursor: "w-full bg-black dark:bg-zinc-900 rounded-md shadow-sm",
                tab: "w-full h-12 text-base",
                tabContent: "text-zinc-600 dark:text-zinc-300 group-data-[selected=true]:text-black dark:group-data-[selected=true]:text-white",
              }}
          >
            <Tab key="description" title={t("description")}>
              <div className="w-full">
                <Prose className="pb-2 pt-16 text-selected-black dark:text-white font-light max-w-none"
                       html={description}/>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
  );
}