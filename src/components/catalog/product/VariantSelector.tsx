"use client";

import {createUrl, getValidTitle} from "@/utils/helper";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import clsx from "clsx";
import {motion} from "framer-motion";

interface VariantOption {
  id: string;
  label?: string;
  adminName?: string;
  value?: string;
  isValid?: boolean;
}

interface VariantAttribute {
  id?: string;
  code: string;
  label?: string;
  options: VariantOption[];
}

/**
 * 变体选择器
 * 所有属性都显示为按钮
 */
export function VariantSelector({
  variants,
  setUserInteracted,
}: {
  variants: VariantAttribute[];
  setUserInteracted?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!variants?.length) return null;

  const handleSelectOption = (
      attributeCode: string,
      optionId: string,
      isValid?: boolean
  ) => {
    if (!isValid) return;

    const nextParams = new URLSearchParams(searchParams.toString());

    if (searchParams.get(attributeCode) === String(optionId)) {
      nextParams.delete(attributeCode);
    } else {
      nextParams.set(attributeCode, String(optionId));
    }

    const optionUrl = createUrl(pathname, nextParams);
    router.replace(optionUrl, {scroll: false});
    setUserInteracted?.(true);
  };

  return (
      <div className="space-y-6">
        {variants.map((attribute, index) => {
          const attributeCode = attribute.code;
          const isSelected = searchParams.has(attributeCode);

        return (
            <motion.div
                key={`${attribute.id || attributeCode}-${index}`}
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.05}}
            >
              {/* 属性标题 */}
              <dt className="mb-4 text-sm capitalize tracking-wide text-gray-800 dark:text-gray-200">
                {attribute.label
                    ? getValidTitle(attribute.label)
                    : getValidTitle(attributeCode)}
                {isSelected && (
                    <span
                        className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  已选
                </span>
                )}
            </dt>

              {/* 选项按钮组 */}
            <dd className="flex flex-wrap gap-3">
              {attribute.options.map((node) => {
                const isActive =
                    searchParams.get(attributeCode) === String(node.id);
                const isAvailable = node?.isValid !== false;
                const displayLabel =
                    node.label || node.adminName || node.value || "";

                return (
                    <motion.button
                    key={node.id}
                    whileHover={isAvailable ? {scale: 1.02} : {}}
                    whileTap={isAvailable ? {scale: 0.98} : {}}
                    disabled={!isAvailable}
                    onClick={() =>
                        handleSelectOption(attributeCode, node.id, isAvailable)
                    }
                    className={clsx(
                        "flex min-w-[80px] items-center justify-center rounded-lg bg-neutral-100 px-3.5 py-2.5 text-sm transition-all duration-300",
                        "dark:bg-neutral-800 dark:text-white",
                      {
                        // 选中状态
                        "cursor-default ring-2 ring-primary text-primary font-medium":
                        isActive,
                        // 未选中但可用
                        "hover:scale-105 hover:border-primary hover:border cursor-pointer":
                          !isActive && isAvailable,
                        // 不可用状态
                        "relative z-10 cursor-not-allowed overflow-hidden bg-neutral-100 text-neutral-500 ring-1 ring-neutral-300 dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-700":
                          !isAvailable,
                      }
                    )}
                  >
                      <span className="font-medium">{displayLabel}</span>
                      {!isAvailable && (
                          <>
                            <span
                                className="absolute inset-x-0 h-px w-full rotate-45 bg-neutral-300 dark:bg-neutral-700"/>
                          </>
                      )}
                    </motion.button>
                );
              })}
            </dd>
            </motion.div>
        );
      })}
      </div>
  );
}

export default VariantSelector;
