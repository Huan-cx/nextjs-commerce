import {safeParse} from "../helper";
import {Spu} from "@/types/api/product/type";

/**
 * 从 Spu 对象中提取超级属性
 */
export function extractSuperAttributes(spu: Spu): any[] {
  if (!spu.skus || spu.skus.length === 0) {
    return [];
  }

  // 收集所有唯一的属性代码
  const attributeCodes = new Set<string>();
  spu.skus.forEach(sku => {
    sku.properties?.forEach(prop => {
      if (prop.propertyName) {
        attributeCodes.add(prop.propertyName);
      }
    });
  });

  // 为每个属性创建超级属性对象
  return Array.from(attributeCodes).map(code => {
    // 收集该属性的所有可能值（使用 valueId 作为键，valueName 作为值）
    const valueMap = new Map<number, string>();
    spu.skus?.forEach(sku => {
      sku.properties?.forEach(prop => {
        if (prop.propertyName === code && prop.valueName && prop.valueId) {
          valueMap.set(prop.valueId, prop.valueName);
        }
      });
    });

    // 创建选项数组
    const options = Array.from(valueMap.entries()).map(([id, value]) => ({
      id: id.toString(),  // 使用 valueId 作为 ID
      label: value,
      value: value
    }));

    return {
      code,
      options
    };
  });
}

/**
 * 为 Spu 创建索引数据
 */
export function createSpuIndex(spu: Spu): Record<string, Record<string, number>> {
  if (!spu.skus || spu.skus.length === 0) {
    return {};
  }

  const index: Record<string, Record<string, number>> = {};

  spu.skus.forEach(sku => {
    if (!sku.id) return;

    const attributes: Record<string, number> = {};
    sku.properties?.forEach(prop => {
      if (prop.propertyName && prop.valueId) {
        attributes[prop.propertyName] = prop.valueId;
      }
    });

    index[sku.id.toString()] = attributes;
  });

  return index;
}

/**
 * 获取变体信息（泛型版本）
 */
export function getVariantInfo<T extends Spu>(
    spu: T,
    params: string
): any {
  const isConfigurable = spu.specType || false;
  const superAttributes = extractSuperAttributes(spu);
  const index = JSON.stringify(createSpuIndex(spu));

  if (!isConfigurable) {
    return {
      Instock: false,
      productid: "",
      possibleOptions: {},
      variantAttributes: superAttributes,
    };
  }

  const searchParams = new URLSearchParams(params);
  const indexData: Record<string, Record<string, number>> =
      safeParse(index) || {};

  const selectedAttributes: Record<string, number> = {};

  for (const attr of superAttributes) {
    const value = searchParams.get(attr.code);
    if (value) {
      selectedAttributes[attr.code] = Number(value);
    }
  }

  const possibleOptions: Record<string, number[]> = {};

  for (const attr of superAttributes) {
    const otherSelectedAttributes = {...selectedAttributes};
    delete otherSelectedAttributes[attr.code];

    const compatibleVariants = Object.entries(indexData).filter(([_, attributes]) =>
        Object.entries(otherSelectedAttributes).every(
            ([code, value]) => attributes[code] === value
        )
    );

    possibleOptions[attr.code] = [];
    for (const [, attributes] of compatibleVariants) {
      const val = attributes[attr.code];
      if (val !== undefined && !possibleOptions[attr.code].includes(val)) {
        possibleOptions[attr.code].push(val);
      }
    }
  }

  const variantAttributes = superAttributes.map((attr) => {
    const rawOptions = Array.isArray(attr.options)
        ? attr.options
        : attr.options?.edges?.map((edge: any) => edge.node) || [];

    return {
      ...attr,
      options: rawOptions.map((option: any) => ({
        ...option,
        isValid: (() => {
          const otherSelectedAttributes = {...selectedAttributes};
          delete otherSelectedAttributes[attr.code];
          const hasOtherSelections =
              Object.keys(otherSelectedAttributes).length > 0;
          return (
              !hasOtherSelections ||
              possibleOptions[attr.code].includes(Number(option.id))
          );
        })(),
      })),
    };
  });

  const allSelected = superAttributes.every(
      (attr) => selectedAttributes[attr.code] !== undefined
  );

  const matchingVariants = Object.entries(indexData).filter(([_, attributes]) =>
      Object.entries(selectedAttributes).every(
          ([code, value]) => attributes[code] === value
      )
  );

  if (allSelected && matchingVariants.length > 0) {
    return {
      productid: matchingVariants[0][0],
      Instock: true,
      possibleOptions,
      variantAttributes,
    };
  }

  return {
    productid: "",
    Instock: matchingVariants.length > 0,
    possibleOptions,
    variantAttributes,
  };
}