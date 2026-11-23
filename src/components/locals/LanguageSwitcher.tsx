"use client";

import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from '@heroui/dropdown';
import {Button} from '@heroui/button';
import {useLocale} from "next-intl";
import clsx from "clsx";
import {Check, Globe} from "lucide-react";
import {IconSkeleton} from "@/components/common/skeleton/IconSkeleton";
import {useLanguageList} from "@/hooks/useLanguageList";

export interface LangDropdownProps {
  className?: string;
}

export const LangDropdown = ({className}: LangDropdownProps) => {
  const locale = useLocale();
  const {languages, isLoading} = useLanguageList();
  const isReady = locale !== undefined && !isLoading;

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return;

    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split("/").filter(Boolean);
    const supportedLocales = languages.map(lang => lang.code);

    if (pathSegments.length > 0 && supportedLocales.includes(pathSegments[0])) {
      pathSegments[0] = newLocale;
    } else {
      pathSegments.unshift(newLocale);
    }

    const newPath = "/" + pathSegments.join("/");
    window.location.href = `${newPath}${window.location.search}`;
  };

  if (!isReady) {
    return <IconSkeleton/>;
  }

  return (
      <Dropdown placement="bottom-end" classNames={{content: "min-w-[140px]"}}>
        <DropdownTrigger>
          <Button
              isIconOnly
              variant="light"
              className={clsx(
                  "flex size-9 lg:size-11 min-w-auto max-w-auto bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer items-center justify-center rounded-sm border border-solid border-neutral-200 transition-opacity dark:border-neutral-700",
                  className
              )}
          >
            <div className="flex items-center justify-center text-black/60 dark:text-white/60">
              <Globe size={20} className="stroke-[1.5]"/>
            </div>
          </Button>
        </DropdownTrigger>

        <DropdownMenu
            aria-label="Language Selection"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={new Set([locale])}
            onAction={(key) => handleLanguageChange(key as string)}
        >
          {languages.map((lang) => {
            const isSelected = locale === lang.code;

            return (
                <DropdownItem
                    key={lang.code}
                    startContent={<span className="text-base mr-1">{lang.flag}</span>}
                    endContent={
                        isSelected && (
                            <Check size={16} className="text-success stroke-[2.5] ml-auto"/>
                        )
                    }
                    className={clsx(
                        "text-small flex items-center justify-between",
                        isSelected && "font-medium text-success bg-success-50 dark:bg-success-900/20"
                    )}
                >
                  {lang.nativeName}
                </DropdownItem>
            );
          })}
        </DropdownMenu>
      </Dropdown>
  );
};

export default LangDropdown;