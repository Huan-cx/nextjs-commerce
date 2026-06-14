import React, {useEffect, useRef, useState} from "react";
import {ChevronDownIcon, ExclamationCircleIcon} from "@heroicons/react/24/outline";
import {getGeoList} from "@utils/api/address";
import clsx from "clsx";
import {isArray} from '@/utils/type-guards';
import {useQuery} from "@tanstack/react-query";
import {Control, Controller} from "react-hook-form";

interface CountrySelectProps {
  control: Control<any>;
  name: string;
  label: string;
  errorMsg?: string | string[];
  required?: boolean;
  className?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  labelPlacement?: "inside" | "outside" | "outside-left";
  showAsterisk?: boolean;
}

const sizeClasses = {
  sm: "text-sm px-2 py-1",
  md: "text-base px-3 py-2",
  lg: "text-lg px-4 py-3",
};

const CountrySelect = ({
                         className,
                         label,
                         name,
                         errorMsg,
                         placeholder,
                         size = "sm",
                         labelPlacement = "outside",
                         showAsterisk = true,
                         required,
                         control,
                       }: CountrySelectProps) => {

  const hasError = Boolean(errorMsg);
  const borderColorClass = hasError
      ? "border-red-500"
      : "border-gray-300 dark:border-gray-500";

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const {data: countries = [], isLoading} = useQuery({
    queryKey: ["countries"],
    queryFn: () => getGeoList(),
  });

  // 过滤国家列表
  const filteredCountries = countries.filter((country: any) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className={clsx("max-w-full mb-2.5", className)} ref={containerRef}>
        {labelPlacement !== "inside" && (
            <label
                className={clsx(
                    "px-1 mb-1 block font-medium text-black dark:text-white"
                )}
                htmlFor={name}
            >
              {label} {showAsterisk && required && <span className="text-red-500">*</span>}
            </label>
        )}
        <div className="relative">
          <Controller
              name={name}
              control={control}
              render={({field}) => {
                // 找到当前选中的国家名称
                const selectedCountry = countries.find((c: any) => c.code === field.value);

                return (
                    <>
                      {/* 输入框 - 与 Input.tsx 完全相同的 className */}
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
                            placeholder={labelPlacement === "inside" ? label : (placeholder || `Select ${label}`)}
                            value={isOpen ? searchTerm : (selectedCountry?.name || "")}
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
                            {isLoading ? (
                                <div className="p-3 text-center text-gray-500">
                                  Loading...
                                </div>
                            ) : filteredCountries.length === 0 ? (
                                <div className="p-3 text-center text-gray-500">
                                  No results found
                                </div>
                            ) : (
                                filteredCountries.map((country: any) => (
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
                                      {country.name}
                                    </div>
                                ))
                            )}
                          </div>
                      )}
                    </>
                );
              }}
          />
          {hasError && (
              <ul className="absolute -bottom-8 py-2 text-sm text-red-500">
                {isArray(errorMsg) ? (
                    (errorMsg as string[]).map((msg, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <ExclamationCircleIcon className="h-5 w-5"/>
                          {msg}
                        </li>
                    ))
                ) : (
                    <li className="flex items-center gap-1 text-xs sm:text-sm">
                      <ExclamationCircleIcon className="size-[18px]"/>
                      {typeof errorMsg === "string"
                          ? errorMsg
                          : JSON.stringify(errorMsg)}
                    </li>
                )}
              </ul>
          )}
        </div>
      </div>
  );
};

CountrySelect.displayName = "CountrySelect";

export default CountrySelect;
