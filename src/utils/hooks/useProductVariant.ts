import React from "react";
import {I18nDataVO, Spu} from "@/types/api/product/type";
import {getTranslation} from "@/utils/i18n/translation";

// ============ 类型定义 ============

interface VariantOption {
  id: string;
  label: string;
  value: string;
  adminName: string;  // 原始名称（用于调试）
  isValid: boolean;   // 是否可选
}

interface VariantAttribute {
  code: string;       // 属性编码（如 "颜色"）
  label: string;      // 属性显示名称
  options: VariantOption[];
}

interface VariantResult {
  productid: string;              // 匹配的 SKU ID
  instock: boolean;              // 是否有库存
  possibleOptions: Record<string, number[]>;  // 可用选项 ID 列表
  variantAttributes: VariantAttribute[];     // 带可选状态的属性列表
  selectedAttributes: Record<string, number>; // 当前已选属性
}

// ============ 内部缓存 ============

/**
 * 商品属性索引缓存（避免重复提取）
 * key: spuId-locale
 */
const attributeCache = new Map<string, VariantAttribute[]>();

/**
 * 变体计算结果缓存（针对相同选择）
 * key: spuId-params-locale
 */
const resultCache = new Map<string, VariantResult>();

/**
 * SKU 快速查找索引缓存
 * key: spuId
 */
const skuIndexCache = new Map<
    string,
    {
      skuEntries: [string, Record<string, number>][];
      skuLookup: Map<string, string>; // 属性组合键 -> SKU ID
    }
>();

// ============ 工具函数 ============

/**
 * 从翻译列表中获取指定语言的名称
 */
function getTranslatedName(
    translations: I18nDataVO[] | undefined,
    locale: string,
    defaultValue: string
): string {
  const translation = getTranslation(translations, locale);
  return translation?.name || defaultValue;
}

/**
 * 构建属性组合查找键（排序确保一致性）
 */
function buildAttributeKey(attributes: Record<string, number>): string {
  return Object.entries(attributes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join("|");
}

// ============ 核心逻辑 ============

/**
 * 从 Spu 对象中提取超级属性（支持多语言翻译）
 * @param spu 商品 SPU
 * @param locale 当前语言（可选，传入则使用翻译后的名称）
 * @param useCache 是否使用缓存
 */
export function extractSuperAttributes(
    spu: Spu,
    locale?: string,
    useCache: boolean = true
): VariantAttribute[] {
  if (!spu.skus || spu.skus.length === 0) {
    return [];
  }

  const cacheKey = `${spu.id}-${locale || "default"}`;
  if (useCache && attributeCache.has(cacheKey)) {
    const cachedValue = attributeCache.get(cacheKey);
    if (cachedValue) {
      return cachedValue;
    }
  }

  // 收集所有唯一的属性（以 propertyId 为键）
  const propertyMap = new Map<number, { code: string; label: string }>();

  for (const sku of spu.skus) {
    if (!sku.properties) continue;

    for (const prop of sku.properties) {
      if (prop.propertyName && prop.propertyId) {
        if (!propertyMap.has(prop.propertyId)) {
          const label = locale
              ? getTranslatedName(prop.propertyTranslations, locale, prop.propertyName)
              : prop.propertyName;
          propertyMap.set(prop.propertyId, {code: prop.propertyName, label});
        }
      }
    }
  }

  // 为每个属性创建超级属性对象
  const skus = spu.skus || [];
  const result = Array.from(propertyMap.values()).map(({code, label}) => {
    // 收集该属性的所有可能值（使用 valueId 作为键）
    const valueMap = new Map<
        number,
        { valueName: string; valueTranslations?: I18nDataVO[] }
    >();

    for (const sku of skus) {
      if (!sku.properties) continue;

      for (const prop of sku.properties) {
        if (prop.propertyName === code && prop.valueName && prop.valueId) {
          if (!valueMap.has(prop.valueId)) {
            valueMap.set(prop.valueId, {
              valueName: prop.valueName,
              valueTranslations: prop.valueTranslations,
            });
          }
        }
      }
    }

    // 创建选项数组
    const options: VariantOption[] = Array.from(
        valueMap.entries()
    ).map(([id, {valueName, valueTranslations}]) => {
      const displayLabel = locale
          ? getTranslatedName(valueTranslations, locale, valueName)
          : valueName;
      return {
        id: id.toString(),
        label: displayLabel,
        value: displayLabel,
        adminName: valueName,
        isValid: true, // 初始默认可选，后续会更新
      };
    });

    return {code, label, options};
  });

  // 缓存结果
  if (useCache) {
    attributeCache.set(cacheKey, result);
  }

  return result;
}

/**
 * 为 Spu 创建 SKU 索引数据
 * @param spu 商品 SPU
 * @param useCache 是否使用缓存
 */
export function createSpuIndex(
    spu: Spu,
    useCache: boolean = true
): {
  skuEntries: [string, Record<string, number>][];
  skuLookup: Map<string, string>;
} {
  const cacheKey = String(spu.id);

  if (useCache && skuIndexCache.has(cacheKey)) {
    const cachedValue = skuIndexCache.get(cacheKey);
    if (cachedValue) {
      return cachedValue;
    }
  }

  const index: Record<string, Record<string, number>> = {};
  const skuLookup = new Map<string, string>();

  if (spu.skus) {
    for (const sku of spu.skus) {
      if (!sku.id) continue;

      const attributes: Record<string, number> = {};
      if (sku.properties) {
        for (const prop of sku.properties) {
          if (prop.propertyName && prop.valueId) {
            attributes[prop.propertyName] = prop.valueId;
          }
        }
      }

      index[sku.id.toString()] = attributes;
      skuLookup.set(buildAttributeKey(attributes), sku.id.toString());
    }
  }

  const result = {
    skuEntries: Object.entries(index),
    skuLookup,
  };

  if (useCache) {
    skuIndexCache.set(cacheKey, result);
  }

  return result;
}

/**
 * 快速检查 SKU 是否与已选属性兼容
 * @param skuAttributes SKU 的属性集合
 * @param selectedAttributes 用户已选属性
 * @param excludeAttr 排除的属性（用于计算该属性的可选值）
 */
function isSkuCompatible(
    skuAttributes: Record<string, number>,
    selectedAttributes: Record<string, number>,
    excludeAttr?: string
): boolean {
  for (const [code, value] of Object.entries(selectedAttributes)) {
    if (code === excludeAttr) continue;
    if (skuAttributes[code] !== value) return false;
  }
  return true;
}

/**
 * 获取变体信息（完全优化版）
 * @param spu 商品 SPU
 * @param params URL 查询参数 或 已选属性对象
 * @param locale 当前语言（可选，传入则使用翻译后的名称）
 * @param useCache 是否使用缓存
 */
export function getVariantInfo<T extends Spu>(
    spu: T,
    params: string | Record<string, number>,
    locale?: string,
    useCache: boolean = true
): VariantResult {
  const isConfigurable = spu.specType || false;
  const superAttributes = extractSuperAttributes(spu, locale, useCache);

  // 不可配置商品直接返回
  if (!isConfigurable) {
    return {
      productid: "",
      instock: false,
      possibleOptions: {},
      variantAttributes: superAttributes,
      selectedAttributes: {},
    };
  }

  // 解析已选属性
  let selectedAttributes: Record<string, number>;
  if (typeof params === "string") {
    const searchParams = new URLSearchParams(params);
    selectedAttributes = {};
    for (const attr of superAttributes) {
      const value = searchParams.get(attr.code);
      if (value) {
        selectedAttributes[attr.code] = Number(value);
      }
    }
  } else {
    selectedAttributes = params;
  }

  // 缓存键
  const cacheKey = `${spu.id}-${
      typeof params === "string" ? params : buildAttributeKey(params)
  }-${locale || "default"}`;

  if (useCache && resultCache.has(cacheKey)) {
    const cachedValue = resultCache.get(cacheKey);
    if (cachedValue) {
      return cachedValue;
    }
  }

  // 获取 SKU 索引
  const {skuEntries, skuLookup} = createSpuIndex(spu, useCache);

  // 预计算可能的选项（一次遍历，并行计算所有属性的可用值）
  const possibleOptions: Record<string, Set<number>> = {};
  for (const attr of superAttributes) {
    possibleOptions[attr.code] = new Set();
  }

  // 单次遍历所有 SKU，计算所有属性的可用值
  for (const [, skuAttrs] of skuEntries) {
    for (const attr of superAttributes) {
      if (isSkuCompatible(skuAttrs, selectedAttributes, attr.code)) {
        const val = skuAttrs[attr.code];
        if (val !== undefined) {
          possibleOptions[attr.code].add(val);
        }
      }
    }
  }

  // 转换为数组格式
  const possibleOptionsArray: Record<string, number[]> = {};
  for (const [code, values] of Object.entries(possibleOptions)) {
    possibleOptionsArray[code] = Array.from(values);
  }

  // 生成变体属性（计算 isValid 状态）
  const variantAttributes = superAttributes.map((attr) => {
    const rawOptions = Array.isArray(attr.options)
        ? attr.options
        : (attr.options as any)?.edges?.map((edge: any) => edge.node) || [];

    const currentPossibleOptions = possibleOptions[attr.code];
    const hasOtherSelections =
        Object.keys(selectedAttributes).length > 0 &&
        !(
            Object.keys(selectedAttributes).length === 1 &&
            selectedAttributes[attr.code] !== undefined
        );

    return {
      ...attr,
      options: rawOptions.map((option: any) => ({
        ...option,
        isValid:
            !hasOtherSelections || currentPossibleOptions.has(Number(option.id)),
      })),
    };
  });

  // 查找匹配的变体
  // 策略：如果有完全匹配的属性组合，直接使用；否则找到第一个与已选属性兼容的 SKU
  let matchingVariantId = "";
  const allSelected = superAttributes.every(
      (attr) => selectedAttributes[attr.code] !== undefined
  );

  if (allSelected) {
    // 所有属性都已选择，使用精确匹配查找
    const lookupKey = buildAttributeKey(selectedAttributes);
    matchingVariantId = skuLookup.get(lookupKey) || "";
    console.warn("[Variant] 全部属性已选，查找键:", lookupKey, "结果:", matchingVariantId);
  } else if (Object.keys(selectedAttributes).length > 0) {
    // 只选择了部分属性，找到第一个与已选属性兼容的 SKU（用于图片预览等场景）
    console.warn("[Variant] 部分属性已选:", selectedAttributes, "开始遍历 SKU 查找匹配");
    for (const [skuId, skuAttrs] of skuEntries) {
      const compatible = isSkuCompatible(skuAttrs, selectedAttributes);
      console.warn(`[Variant] SKU ${skuId}:`, skuAttrs, "匹配:", compatible);
      if (compatible) {
        matchingVariantId = skuId;
        break;
      }
    }
  } else {
    console.warn("[Variant] 未选择任何属性");
  }

  // 判断库存状态：如果找到匹配的 SKU 且 SKU 有库存，则为有库存
  let hasStock = false;
  if (matchingVariantId) {
    const matchedSku = spu.skus?.find((s) => String(s.id) === matchingVariantId);
    hasStock = (matchedSku?.stock ?? 0) > 0;
    console.warn("[Variant] 匹配 SKU 库存检查:",
        {skuId: matchingVariantId, skuName: matchedSku?.name, stock: matchedSku?.stock, hasStock});
  }

  const result: VariantResult = {
    productid: matchingVariantId,
    instock: hasStock,
    possibleOptions: possibleOptionsArray,
    variantAttributes,
    selectedAttributes,
  };

  // 缓存结果
  if (useCache) {
    resultCache.set(cacheKey, result);
  }

  return result;
}

/**
 * 获取当前选择匹配的 SKU 对象
 */
export function getSelectedSku(
    spu: Spu,
    selectedAttributes: Record<string, number>
): any | null {
  if (!spu.skus) return null;

  for (const sku of spu.skus) {
    if (!sku.properties) continue;

    const isMatch = sku.properties.every((prop) => {
      const selectedValue = selectedAttributes[prop.propertyName];
      return selectedValue === undefined || prop.valueId === selectedValue;
    });

    if (isMatch) {
      return sku;
    }
  }

  return null;
}

/**
 * 清理缓存（商品数据更新时调用）
 */
export function clearVariantCache(spuId?: number | string): void {
  if (spuId) {
    // 清理指定商品的缓存
    const idStr = String(spuId);

    // 清理属性缓存
    for (const key of attributeCache.keys()) {
      if (key.startsWith(idStr)) {
        attributeCache.delete(key);
      }
    }

    // 清理结果缓存
    for (const key of resultCache.keys()) {
      if (key.startsWith(idStr)) {
        resultCache.delete(key);
      }
    }

    // 清理 SKU 索引缓存
    skuIndexCache.delete(idStr);
  } else {
    // 清理所有缓存
    attributeCache.clear();
    resultCache.clear();
    skuIndexCache.clear();
  }
}

/**
 * 获取缓存统计信息（用于调试和监控）
 */
export function getVariantCacheStats(): {
  attributeCacheSize: number;
  resultCacheSize: number;
  skuIndexCacheSize: number;
} {
  return {
    attributeCacheSize: attributeCache.size,
    resultCacheSize: resultCache.size,
    skuIndexCacheSize: skuIndexCache.size,
  };
}

// ============ React Hook 封装（可选，用于组件中使用） ============

/**
 * React Hook: 使用商品变体选择器
 * @param spu 商品 SPU 对象
 * @param initialSelection 初始选择
 * @param locale 当前语言
 */
export function useProductVariant(
    spu: Spu,
    initialSelection: Record<string, number> = {},
    locale?: string
) {
  const [selected, setSelected] = React.useState<Record<string, number>>(
      initialSelection
  );

  const variantInfo = React.useMemo(
      () => getVariantInfo(spu, selected, locale, true),
      [spu, selected, locale]
  );

  const selectOption = React.useCallback(
      (attributeCode: string, optionValueId: number | null) => {
        setSelected((prev) => {
          if (optionValueId === null) {
            const {[attributeCode]: _, ...rest} = prev;
            return rest;
          }
          return {...prev, [attributeCode]: optionValueId};
        });
      },
      []
  );

  const clearSelection = React.useCallback(() => {
    setSelected({});
  }, []);

  const selectedSku = React.useMemo(
      () => getSelectedSku(spu, selected),
      [spu, selected]
  );

  return {
    ...variantInfo,
    selected,
    selectOption,
    clearSelection,
    selectedSku,
    isAllSelected: variantInfo.productid !== "",
  };
}

const variantUtils = {
  getVariantInfo,
  extractSuperAttributes,
  createSpuIndex,
  getSelectedSku,
  clearVariantCache,
  getVariantCacheStats,
  useProductVariant,
};

// 导出默认对象（保持向后兼容）
export default variantUtils;