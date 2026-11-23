import React, {useEffect, useRef, useState} from "react";
import {ChevronDownIcon, ExclamationCircleIcon} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {isArray} from '@/utils/type-guards';
import {Control, Controller} from "react-hook-form";
import {useLocale} from "next-intl";
import {COUNTRY_LIST, CountryData} from "./datas";

interface CountrySelectProps {
  control: Control<any>;
  name: string;
  label: string;
  errorMsg?: string | string[];
  required?: boolean;
  className?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  showAsterisk?: boolean;
  labelPlacement?: "inside" | "outside" | "outside-left";
  rules?: {
    required?: string | boolean;
  };
}

const sizeClasses = {
  sm: "text-sm px-2 py-2",
  md: "text-base px-3 py-2.5",
  lg: "text-lg px-4 py-3",
};

const CountrySelect = ({
                         className,
                         label,
                         name,
                         errorMsg,
                         placeholder,
                         size = "sm",
                         showAsterisk = true,
                         required,
                         control,
                         rules,
                         labelPlacement: _labelPlacement,
                       }: CountrySelectProps) => {

  const locale = useLocale();
  const hasError = Boolean(errorMsg);
  const borderColorClass = hasError
      ? "border-red-500"
      : "border-gray-300 dark:border-gray-500 focus:border-blue-500";

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取当前语言对应的国家名称
  const getCountryDisplayName = (country: CountryData): string => {
    return country.name[locale as keyof typeof country.name] || country.name['en-US'];
  };

  // 过滤国家列表（支持按任意语言搜索）
  const filteredCountries = COUNTRY_LIST.filter((country) => {
    const searchLower = searchTerm.toLowerCase();
    return Object.values(country.name).some(
        (name) => name.toLowerCase().includes(searchLower)
    );
  });

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
      <div className={clsx("max-w-full", className)} ref={containerRef}>
        {/* 外部标签 */}
        <label
            className="px-1 mb-1.5 block font-medium text-black dark:text-white text-sm"
            htmlFor={name}
        >
          {label} {showAsterisk && required && <span className="text-red-500">*</span>}
        </label>

        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({field}) => {
              // 找到当前选中的国家名称
              const selectedCountry = COUNTRY_LIST.find((c) => c.code === field.value);

              return (
                  <>
                    {/* 输入框 */}
                    <div
                        className="relative"
                        onClick={() => setIsOpen(true)}
                    >
                      <input
                          type="text"
                          className={clsx(
                              "w-full !rounded-[0.62rem] border bg-transparent text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white",
                              borderColorClass,
                              sizeClasses[size],
                              "pr-10"
                          )}
                          id={name}
                          name={name}
                          placeholder={placeholder || `Select ${label}`}
                          value={isOpen ? searchTerm : (selectedCountry ? getCountryDisplayName(selectedCountry) : "")}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            if (!isOpen) setIsOpen(true);
                          }}
                          onFocus={() => setIsOpen(true)}
                      />
                      <ChevronDownIcon
                          className={clsx(
                              "absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform pointer-events-none",
                              isOpen && "rotate-180"
                          )}
                      />
                    </div>

                    {/* 下拉列表 */}
                    {isOpen && (
                        <div
                            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 !rounded-[0.62rem] border border-gray-200 dark:border-gray-700 shadow-lg max-h-60 overflow-y-auto">
                          {filteredCountries.length === 0 ? (
                              <div className="p-3 text-center text-gray-500">
                                No results found
                              </div>
                          ) : (
                              filteredCountries.map((country) => (
                                  <div
                                      key={country.code}
                                      className={clsx(
                                          "px-3 py-2 cursor-pointer",
                                          "hover:bg-gray-100 dark:hover:bg-gray-700",
                                          field.value === country.code && "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                                      )}
                                      onClick={() => {
                                        field.onChange(country.code);
                                        setSearchTerm("");
                                        setIsOpen(false);
                                      }}
                                  >
                                    {getCountryDisplayName(country)}
                                  </div>
                              ))
                          )}
                        </div>
                    )}
                  </>
              );
            }}
        />

        {/* 错误提示 */}
        {hasError && (
            <div className="mt-1 flex items-start gap-1.5 text-xs text-red-500">
              <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0 mt-0.5"/>
              <div>
                {isArray(errorMsg) ? (
                    <ul className="space-y-0.5">
                      {(errorMsg as string[]).map((msg, index) => (
                          <li key={index}>{msg}</li>
                      ))}
                    </ul>
                ) : (
                    <span>{typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg)}</span>
                )}
              </div>
            </div>
        )}
      </div>
  );
};

CountrySelect.displayName = "CountrySelect";

export default CountrySelect;