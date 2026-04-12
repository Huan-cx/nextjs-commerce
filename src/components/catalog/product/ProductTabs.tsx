"use client";

import {Tab, Tabs} from "@heroui/react";
import {Spu} from "@/types/api/product/type";
import Prose from "@components/theme/search/Prose";
import React from "react";


export default function ProductTabs({product}: { product: Spu }) {
  return (
      <div className="flex w-full flex-col items-center mt-16">
        <Tabs
            aria-label="Product Details"
            variant="underlined"
            size="lg"
            color="secondary"
            fullWidth={true}
            classNames={{
              base: "w-full flex justify-center bg-neutral-100",
              tabList: "p-1.5 max-w-md w-full bg-transparent rounded-md",
              cursor: "w-full bg-black dark:bg-zinc-900 rounded-md shadow-sm",
              tab: "w-full h-12 text-base",
              tabContent: "text-zinc-600 dark:text-zinc-300 group-data-[selected=true]:text-black dark:group-data-[selected=true]:text-white",
            }}
        >
          <Tab key="description" title="Description">
            <Prose className="pb-2 pt-16 text-selected-black dark:text-white font-light max-w-[1270px] mx-auto"
                   html={product?.description || ""}/>
          </Tab>

        </Tabs>
      </div>
  );
}