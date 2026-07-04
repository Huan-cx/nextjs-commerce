"use client";
import {Accordion, AccordionItem} from "@heroui/accordion";
import React, {FC} from "react";
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/24/outline";
import Prose from "@/components/theme/search/Prose";
import {additionalDataTypes} from "../type";
import {useTranslations} from "next-intl";

export const ProductMoreDetails: FC<{
  description: string;
  additionalData: additionalDataTypes[];
  expandedKeys: Set<string>;
  setExpandedKeys: (keys: Set<string>) => void;
}> = ({description, additionalData, expandedKeys, setExpandedKeys}) => {
  const t = useTranslations("product");
  
  const filterAdditionalData = additionalData.filter((item) => item?.attribute?.isVisibleOnFront == "1");


  return (
      <div className="mt-7 sm:my-7">
        <Accordion
            itemClasses={{
              base: "shadow-none  bg-neutral-100 dark:bg-neutral-800",
            }}
            className="px-0"
            selectionMode="multiple"
            showDivider={false}
            variant="splitted"
            selectedKeys={expandedKeys}
            onSelectionChange={(keys) => setExpandedKeys(keys as Set<string>)}
        >
          <AccordionItem
              key="1"
              className="lg:hidden"
              classNames={{
                title: "text-start",
                trigger: "cursor-pointer",
              }}
              indicator={({isOpen}) =>
                  isOpen ? (
                      <ChevronLeftIcon className="h-5 w-5 stroke-neutral-800 dark:stroke-white"/>
                  ) : (
                      <ChevronRightIcon className="h-5 w-5 stroke-neutral-800 dark:stroke-white"/>
                  )
              }
              aria-label={t("description")}
              title={t("description")}
          >
            <Prose className="pb-2 text-selected-black dark:text-white font-light" html={description}/>
          </AccordionItem>

          {filterAdditionalData.length > 0
              ?
              <AccordionItem
                  key="2"
                  classNames={{
                    title: "text-start",
                    trigger: "cursor-pointer",
                  }}
                  indicator={({isOpen}) =>
                      isOpen ? (
                          <ChevronLeftIcon className="h-5 w-5 stroke-neutral-800 dark:stroke-white"/>
                      ) : (
                          <ChevronRightIcon className="h-5 w-5 stroke-neutral-800 dark:stroke-white"/>
                      )
                  }
                  aria-label={t("additionalInformation")}
                  title={t("additionalInformation")}
              >
                <div className="grid max-w-max grid-cols-[auto_1fr] gap-x-8 gap-y-4 px-1 pb-2">
                  {filterAdditionalData?.map((item) => (
                      <React.Fragment key={item.label}>
                        <div className="grid">
                          <p className="text-base font-normal text-selected-black dark:text-white">
                            {item?.label || item?.attribute?.adminName}
                          </p>
                        </div>
                        <div className="grid">
                          <p className="text-base font-normal text-selected-black dark:text-white">
                            {item?.value || "--"}
                          </p>
                        </div>
                      </React.Fragment>
                  ))}
                </div>
              </AccordionItem>

              : null}
        </Accordion>
      </div>
  );
};