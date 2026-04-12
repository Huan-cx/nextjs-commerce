import React from "react";
import {ExclamationCircleIcon} from "@heroicons/react/24/outline";
import {Autocomplete, AutocompleteItem} from "@heroui/react";
import {getGeoList} from "@utils/api/address";
import clsx from "clsx";
import {isArray} from '@/utils/type-guards';
import {useQuery} from "@tanstack/react-query";
import {Control, Controller} from "react-hook-form";

// Omit props that will be handled by the Controller
interface CountrySelectProps {
  control: Control<any>;
  name: string;
  label: string;
  errorMsg?: string | string[];
  required?: boolean; // Keep for the asterisk
}

const CountrySelect = (
    {
      className,
      label,
      name,
      errorMsg,
      placeholder,
      labelPlacement = "outside",
      showAsterisk = true,
      required,
      control,
      ...rest
    }: CountrySelectProps & {
      className?: string;
      placeholder?: string;
      size?: "sm" | "md" | "lg";
      labelPlacement?: "inside" | "outside" | "outside-left";
      rounded?: "sm" | "md" | "lg";
      showAsterisk?: boolean;
    }) => {

  const hasError = Boolean(errorMsg);
  const borderColorClass = hasError
      ? "border-red-500"
      : "border-gray-300 dark:border-gray-500";

  const {data: countries = [], isLoading} = useQuery({
    queryKey: ["countries"],
    queryFn: () => getGeoList(),
  });

  return (
      <div className={clsx("max-w-full mb-2.5", className)}>
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
              render={({field}) => (
                  <Autocomplete
                      id={name}
                      variant="bordered"
                      className="w-full max-w-xs"
                      // 使用 inputProps 注入内部 Input 的样式，解决 TS 报错
                      inputProps={{
                        classNames: {
                          // inputWrapper 是真正控制边框、背景、圆角、聚焦环的地方
                          inputWrapper: clsx(
                              "w-full h-1·1 bg-transparent",
                              "!rounded-[0.62rem]", // 强制覆盖默认圆角
                              "border-1",           // 开启基础边框
                              borderColorClass,      // 动态传入你的边框颜色类
                              "text-gray-900 dark:text-white",
                              // 模拟 focus:ring-2 focus:ring-blue-500
                              "group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-blue-500",
                              "group-data-[focus=true]:border-transparent", // 聚焦时通常隐藏原边框以显示 ring
                              "group-data-[focus=true]:outline-none",
                          ),
                          // 内部 input 标签自身的样式
                          input: "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                        },
                      }}
                      // 这里的 classNames 只处理 Autocomplete 特有的部分（如下拉框）
                      classNames={{
                        base: "h-11",
                        listboxWrapper: "rounded-[0.62rem]",
                        popoverContent: "rounded-[0.62rem] border-small border-default-200",
                      }}
                      // className={clsx(
                      //     "w-full max-w-xs h-11 content-center bg-transparent text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white",
                      //     borderColorClass,
                      //     sizeClasses[size],
                      //     roundedClasses[rounded],
                      //     labelPlacement === "inside"
                      //         ? "placeholder-input-color dark:placeholder-selected-color-dark"
                      //         : ""
                      // )}
                      // classNames={{
                      //   base: "h-11 content-center", // 基础容器高度
                      //   inputWrapper: [
                      //       "border-2", // 边框宽度
                      //       "!rounded-[0.62rem]", // 强制覆盖默认圆角
                      //       "bg-transparent text-gray-900 dark:text-white",
                      //       "focus-within:ring-2 focus-within:ring-blue-500", // 注意：Autocomplete 内部是 focus-within
                      //       "hover:border-blue-700",
                      //       "group-data-[focus=true]:border-purple-600"
                      //   ],
                      // }}
                      placeholder={labelPlacement === "inside" ? label : (placeholder || `Select ${label}`)}
                      menuTrigger="focus"
                      isLoading={isLoading}
                      selectedKey={field.value}
                      onSelectionChange={field.onChange}
                      onBlur={field.onBlur}
                      {...rest}
                  >
                    {countries.map((country: any) => (
                        <AutocompleteItem key={country.code}>
                          {country.name}
                        </AutocompleteItem>
                    ))}
                  </Autocomplete>
              )}
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
                      {typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg)}
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