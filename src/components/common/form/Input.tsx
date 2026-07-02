import {ExclamationCircleIcon} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {forwardRef} from "react";
import {isArray} from '@/utils/type-guards';

interface InputTextProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  className?: string;
  label: string;
  name: string;
  errorMsg?: string | string[] | Record<string, unknown>;
  defaultValue?: string;
  typeName?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  rounded?: "sm" | "md" | "lg" | "xl";
  showAsterisk?: boolean;
  labelPlacement?: "inside" | "outside" | "outside-left";
}

const sizeClasses = {
  sm: "text-sm px-2 py-2",
  md: "text-base px-3 py-2.5",
  lg: "text-lg px-4 py-3",
};

const InputText = forwardRef<HTMLInputElement, InputTextProps>(
  (
    {
      className,
      label,
      name,
      errorMsg,
      defaultValue,
      typeName = "text",
      placeholder,
      size = "sm",
      rounded: _rounded,
      required,
      showAsterisk = true,
      labelPlacement: _labelPlacement,
      ...rest
    },
    ref
  ) => {
    const hasError = Boolean(errorMsg);

    const borderColorClass = hasError
      ? "border-red-500"
        : "border-gray-300 dark:border-gray-500 focus:border-blue-500";

    return (
        <div className={clsx("max-w-full", className)}>
          {/* 外部标签 */}
          <label
              className="px-1 mb-1.5 block font-medium text-black dark:text-white text-sm"
              htmlFor={name}
          >
            {label} {showAsterisk && required && <span className="text-red-500">*</span>}
          </label>

          {/* 输入框 */}
          <input
              ref={ref}
              className={clsx(
                  "w-full !rounded-[0.62rem] border bg-transparent text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white",
                  borderColorClass,
                  sizeClasses[size]
              )}
              defaultValue={defaultValue}
              id={name}
              name={name}
              placeholder={placeholder}
              type={typeName}
              required={required}
              {...rest}
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
  }
);

InputText.displayName = "InputText";

export default InputText;