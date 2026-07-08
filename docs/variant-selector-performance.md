# VariantSelector 性能优化方案

## 一、问题分析

### 1.1 现有实现问题

当前 `useVariantInfo.ts` 存在以下性能瓶颈：

| 问题类型                  | 代码位置      | 复杂度       | 影响描述               |
|-----------------------|-----------|-----------|--------------------|
| **JSON 反序列化**         | 第 18-19 行 | O(n)      | 每次调用都要解析字符串，浪费 CPU |
| **嵌套循环**              | 第 32-49 行 | O(n² × m) | 属性数 × SKU 数的平方级复杂度 |
| **Array.includes 查找** | 第 45 行    | O(k)      | 每次检查都遍历数组          |
| **重复计算 isValid**      | 第 60-69 行 | O(n)      | 每个选项都重新计算，重复劳动     |

### 1.2 性能影响数据

| SKU 数量 | 属性数量 | 预估操作次数   | 响应时间        |
|--------|------|----------|-------------|
| 100    | 10   | ~10,000  | 50-100ms    |
| 500    | 20   | ~200,000 | 500-1000ms  |
| 1000   | 20   | ~400,000 | 1000-2000ms |

### 1.3 核心问题代码

```typescript
// 问题 1：不必要的序列化/反序列化
const indexData: Record<string, Record<string, number>> =
    safeParse(index) || {};

// 问题 2：O(n²) 嵌套循环
for (const attr of superAttributes) {
  for (const [, attributes] of compatibleVariants) {
    if (!possibleOptions[attr.code].includes(val)) {  // O(k) 查找
      possibleOptions[attr.code].push(val);
    }
  }
}

// 问题 3：重复计算 isValid
options: rawOptions.map((option: any) => ({
  isValid: (() => { /* 每个选项都执行一次 */
  })(),
}))
```

---

## 二、优化方案

### 2.1 方案对比

| 方案         | 复杂度      | 实现难度 | 性能提升      | 适用场景     |
|------------|----------|------|-----------|----------|
| **客户端优化**  | O(n × m) | 低    | 10-20x    | 中小规模 SKU |
| **服务端预计算** | O(1) 客户端 | 中    | 100-1000x | 大规模 SKU  |
| **状态机模式**  | O(n)     | 中    | 5-10x     | 需要复杂状态管理 |

### 2.2 推荐方案：服务端预计算

#### 2.2.1 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                     服务端层                                │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │   Product API   │───▶│ 预计算服务      │               │
│  └─────────────────┘    └────────┬────────┘               │
│                                  │                         │
│                    ┌─────────────▼─────────────┐           │
│                    │      Redis 缓存层          │           │
│                    │  TTL: 30分钟              │           │
│                    └─────────────┬─────────────┘           │
└──────────────────────────────────┼──────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     客户端层                                │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │  React Query    │───▶│ VariantSelector │               │
│  │  5分钟缓存      │    │ 直接使用数据    │               │
│  └─────────────────┘    └─────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2.2 API 接口设计

**GET /api/variant/{productId}**

| 参数          | 类型     | 必填 | 说明    |
|-------------|--------|----|-------|
| `productId` | number | 是  | 商品 ID |
| `locale`    | string | 否  | 语言代码  |

**响应结构**：

```typescript
interface VariantResponse {
  productId: number;
  attributes: VariantAttribute[];
  compatibilityMatrix: Record<string, number[]>;
  defaultSelection: Record<string, number>;
  skuMap: Record<number, SkuInfo>;

  // 新增：图片映射
  imageMapping: ImageMapping;
  attributeImageMap: Record<string, Record<number, string>>;
}

interface VariantAttribute {
  code: string;
  label: string;
  options: VariantOption[];
}

interface VariantOption {
  id: number;
  label: string;
  value: string;
}

interface SkuInfo {
  id: number;
  price: number;
  stock: number;
  imageUrl: string;
  attributes: Record<string, number>;
}

interface ImageMapping {
  [skuId: string]: string;  // SKU ID -> 图片 URL
  default: string;          // 默认图片
}
```

#### 2.2.3 兼容性矩阵格式

```typescript
// key: 属性组合（按字母排序）
// value: 兼容的 SKU ID 列表
{
  "color:1"
:
  [1, 2, 3],
      "size:2"
:
  [2, 3, 4],
      "color:1|size:2"
:
  [2, 3]
}
```

---

## 三、优化后代码示例

### 3.1 优化后的 useVariantInfo.ts

```typescript
/**
 * 优化后的变体信息获取 Hook
 * 使用 React Query 缓存，避免重复计算
 */
import {useQuery} from '@tanstack/react-query';
import {getVariantData} from '@api/variant';

export function useVariantInfo(productId: number, locale?: string) {
  return useQuery({
    queryKey: ['variant', productId, locale],
    queryFn: () => getVariantData(productId, locale),
    staleTime: 5 * 60 * 1000,  // 5分钟缓存
    cacheTime: 30 * 60 * 1000, // 30分钟缓存
    suspense: true,
  });
}
```

### 3.2 优化后的 VariantSelector.tsx（含图片切换）

```tsx
import {useMemo, useState, useEffect} from 'react';
import {Button} from '@heroui/react';
import {motion, AnimatePresence} from 'framer-motion';

export function VariantSelector({
                                  attributes,
                                  compatibilityMatrix,
                                  skuMap,
                                  imageMapping,
                                  attributeImageMap,
                                  onSelect,
                                }: {
  attributes: VariantAttribute[];
  compatibilityMatrix: Record<string, number[]>;
  skuMap: Record<number, SkuInfo>;
  imageMapping: ImageMapping;
  attributeImageMap: Record<string, Record<number, string>>;
  onSelect: (selection: Record<string, number>) => void;
}) {
  const [selected, setSelected] = useState<Record<string, number>>({});

  // 根据当前选择计算显示的图片
  const currentImage = useMemo(() => {
    // 1. 找到匹配的 SKU
    const matchingSkuId = findMatchingSku(skuMap, selected);

    if (matchingSkuId) {
      // 2. 使用 SKU 对应的图片
      return imageMapping[matchingSkuId] || imageMapping.default;
    }

    // 3. 如果没有完全匹配，尝试部分匹配
    for (const [code, value] of Object.entries(selected)) {
      const partialImage = attributeImageMap[code]?.[value];
      if (partialImage) return partialImage;
    }

    // 4. 默认图片
    return imageMapping.default;
  }, [selected, skuMap, imageMapping, attributeImageMap]);

  // 预加载图片
  useEffect(() => {
    const allImages = [
      imageMapping.default,
      ...Object.values(imageMapping),
      ...Object.values(attributeImageMap).flatMap(v => Object.values(v)),
    ];
    preloadImages(allImages);
  }, [imageMapping, attributeImageMap]);

  // 使用 useMemo 缓存可用选项计算
  const availableOptions = useMemo(() => {
    return attributes.map(attr => ({
      ...attr,
      options: attr.options.map(opt => ({
        ...opt,
        isAvailable: isOptionAvailable(attr.code, opt.id, selected, compatibilityMatrix),
      })),
    }));
  }, [attributes, selected, compatibilityMatrix]);

  const handleSelect = (code: string, value: number) => {
    const newSelection = {...selected, [code]: value};
    setSelected(newSelection);
    onSelect(newSelection);
  };

  return (
      <div className="space-y-4">
        {/* 产品图片 */}
        <div className="mb-4">
          <AnimatePresence mode="wait">
            <motion.img
                key={currentImage}
                src={currentImage}
                alt="Product"
                initial={{opacity: 0, scale: 0.95}}
                animate={{opacity: 1, scale: 1}}
                exit={{opacity: 0, scale: 1.05}}
                transition={{duration: 0.2}}
                className="w-full h-64 object-contain"
            />
          </AnimatePresence>
        </div>

        {/* 属性选择器 */}
        {availableOptions.map(attr => (
            <div key={attr.code} className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">{attr.label}</h3>
              <div className="flex flex-wrap gap-2">
                {attr.options.map(opt => (
                    <Button
                        key={opt.id}
                        variant={selected[attr.code] === opt.id ? 'primary' : 'outline'}
                        disabled={!opt.isAvailable}
                        onClick={() => handleSelect(attr.code, opt.id)}
                        className={`
                  px-4 py-2 rounded-lg transition-all
                  ${!opt.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                    >
                      {opt.label}
                    </Button>
                ))}
              </div>
            </div>
        ))}
      </div>
  );
}

/**
 * 检查选项是否可用
 * 时间复杂度: O(1)（使用预计算的兼容性矩阵）
 */
function isOptionAvailable(
    code: string,
    value: number,
    selected: Record<string, number>,
    matrix: Record<string, number[]>
): boolean {
  const testSelection = {...selected, [code]: value};
  const key = Object.entries(testSelection)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');

  return !!matrix[key]?.length;
}

/**
 * 查找匹配的 SKU
 */
function findMatchingSku(
    skuMap: Record<number, SkuInfo>,
    selected: Record<string, number>
): string | null {
  const selectedKeys = Object.keys(selected);
  if (selectedKeys.length === 0) return null;

  for (const [skuId, skuInfo] of Object.entries(skuMap)) {
    let matches = true;
    for (const key of selectedKeys) {
      if (skuInfo.attributes[key] !== selected[key]) {
        matches = false;
        break;
      }
    }
    if (matches) return skuId;
  }

  return null;
}

/**
 * 预加载图片
 */
function preloadImages(imageUrls: string[]): void {
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
    img.onload = () => console.log(`Image loaded: ${url}`);
    img.onerror = () => console.warn(`Failed to load: ${url}`);
  });
}
```

### 3.3 服务端兼容性矩阵生成

```typescript
/**
 * 构建兼容性矩阵
 * 时间复杂度: O(m × 2^n)，m=SKU数，n=属性数
 * 在服务端预计算，客户端直接使用
 */
export function buildCompatibilityMatrix(skus: Sku[]): Record<string, number[]> {
  const matrix: Record<string, number[]> = {};

  skus.forEach(sku => {
    if (!sku.id) return;

    const attrPairs = Object.entries(sku.attributes).sort();
    const skuId = sku.id.toString();

    // 生成所有非空子集
    for (let mask = 1; mask < (1 << attrPairs.length); mask++) {
      const keyParts: string[] = [];
      for (let i = 0; i < attrPairs.length; i++) {
        if (mask & (1 << i)) {
          keyParts.push(`${attrPairs[i][0]}:${attrPairs[i][1]}`);
        }
      }
      const key = keyParts.join('|');

      if (!matrix[key]) {
        matrix[key] = [];
      }
      if (!matrix[key].includes(skuId)) {
        matrix[key].push(skuId);
      }
    }
  });

  return matrix;
}

/**
 * 构建图片映射
 */
export function buildImageMapping(skus: Sku[], defaultImage: string): ImageMapping {
  const mapping: ImageMapping = {default: defaultImage};

  skus.forEach(sku => {
    if (sku.id && sku.imageUrl) {
      mapping[sku.id.toString()] = sku.imageUrl;
    }
  });

  return mapping;
}

/**
 * 构建属性值到图片的映射
 */
export function buildAttributeImageMap(skus: Sku[]): Record<string, Record<number, string>> {
  const map: Record<string, Record<number, string>> = {};

  skus.forEach(sku => {
    if (!sku.imageUrl) return;

    Object.entries(sku.attributes).forEach(([code, value]) => {
      if (!map[code]) {
        map[code] = {};
      }
      // 优先使用已有的图片，避免覆盖
      if (!map[code][value]) {
        map[code][value] = sku.imageUrl;
      }
    });
  });

  return map;
}
```

---

## 四、图片切换机制详解

### 4.1 核心需求分析

| 场景        | 用户操作    | 期望行为       |
|-----------|---------|------------|
| **单属性选择** | 选择颜色    | 显示对应颜色的图片  |
| **多属性组合** | 选择颜色+尺寸 | 显示对应组合的图片  |
| **部分选择**  | 只选颜色    | 显示该颜色的默认图片 |
| **不可用组合** | 选择无效组合  | 显示占位图或提示   |

### 4.2 图片切换流程

```
┌─────────────────────────────────────────────────────────────┐
│                    图片切换流程                             │
├─────────────────────────────────────────────────────────────┤
│  1. 用户选择属性                                            │
│       │                                                    │
│       ▼                                                    │
│  2. 计算当前选择的属性组合                                   │
│       │                                                    │
│       ▼                                                    │
│  3. 在 SKU Map 中查找匹配的 SKU                             │
│       │                                                    │
│       ├── 找到匹配 ──▶ 使用对应 SKU 的图片                   │
│       │                                                    │
│       └── 未找到 ──▶ 使用部分匹配的属性图片                   │
│                       │                                    │
│                       └── 无部分匹配 ──▶ 使用默认图片         │
│                                                             │
│  4. 执行图片切换动画                                         │
│       │                                                    │
│       ▼                                                    │
│  5. 预加载其他可能用到的图片                                  │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 图片预加载策略

```typescript
/**
 * 预加载所有可能的产品图片
 * @param imageUrls - 需要预加载的图片 URL 列表
 */
function preloadImages(imageUrls: string[]): void {
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
    img.onload = () => console.log(`Image loaded: ${url}`);
    img.onerror = () => console.warn(`Failed to load: ${url}`);
  });
}
```

### 4.4 图片切换动画

使用 `framer-motion` 实现平滑的图片切换动画：

```tsx
<AnimatePresence mode="wait">
  <motion.img
      key={currentImage}
      src={currentImage}
      alt="Product"
      initial={{opacity: 0, scale: 0.95}}
      animate={{opacity: 1, scale: 1}}
      exit={{opacity: 0, scale: 1.05}}
      transition={{duration: 0.2}}
  />
</AnimatePresence>
```

---

## 五、实施计划

### 5.1 阶段划分

| 阶段          | 时间    | 任务                          | 负责人  |
|-------------|-------|-----------------------------|------|
| **Phase 1** | 1-2 天 | 后端 API 开发（含图片映射）            | 后端开发 |
| **Phase 2** | 1-2 天 | 前端 Hook 改造                  | 前端开发 |
| **Phase 3** | 1-2 天 | VariantSelector 组件重构（含图片切换） | 前端开发 |
| **Phase 4** | 1 天   | 联调测试                        | 全组   |
| **Phase 5** | 1 天   | 性能测试 + 优化                   | 全组   |

### 5.2 关键里程碑

| 里程碑          | 验收标准                                     |
|--------------|------------------------------------------|
| 后端 API 完成    | `/api/variant/{productId}` 返回正确数据（含图片映射） |
| 前端 Hook 改造完成 | `useVariantInfo` 正确调用 API                |
| 组件重构完成       | VariantSelector 使用预计算数据，支持图片切换           |
| 性能测试通过       | 1000 SKU 响应时间 < 50ms                     |
| 回归测试通过       | 现有功能无 regression，图片切换正常                  |

### 5.3 迁移策略

```
阶段 1: 并行运行
├── 保留旧版 getVariantInfo
├── 开发新版 API
└── 通过配置开关控制使用哪套方案

阶段 2: 灰度发布
├── 对 10% 用户开放新版
├── 监控性能指标
└── 对比新旧方案

阶段 3: 全量切换
├── 关闭旧版方案
├── 删除旧代码
└── 完善文档
```

---

## 六、测试计划

### 6.1 单元测试

| 测试项        | 测试用例       | 预期结果      |
|------------|------------|-----------|
| 兼容性矩阵生成    | 3个SKU，2个属性 | 生成7个组合键   |
| 默认选择逻辑     | 多个SKU有库存   | 选择库存最多的组合 |
| 缓存机制       | 连续两次调用     | 第二次使用缓存   |
| 选项可用性检查    | 有效组合/无效组合  | 返回正确的可用性  |
| **图片映射生成** | 多个SKU带不同图片 | 正确生成映射    |
| **图片切换逻辑** | 选择不同属性组合   | 显示对应图片    |

### 6.2 性能测试

| 场景        | 指标     | 预期结果    |
|-----------|--------|---------|
| 100 SKU   | 响应时间   | < 30ms  |
| 500 SKU   | 响应时间   | < 50ms  |
| 1000 SKU  | 响应时间   | < 100ms |
| 并发 100 用户 | 错误率    | 0%      |
| **图片切换**  | 动画过渡时间 | < 200ms |

### 6.3 回归测试

| 测试场景     | 覆盖点          |
|----------|--------------|
| 属性选择     | 正确显示可选/不可选状态 |
| SKU 切换   | 价格、库存正确更新    |
| **图片切换** | 属性变化时图片正确切换  |
| 语言切换     | 属性名称正确翻译     |
| 缓存刷新     | 修改后数据正确更新    |

---

## 七、预期收益

### 7.1 性能对比

| 指标         | 优化前        | 优化后     | 提升幅度       |
|------------|------------|---------|------------|
| **首次加载时间** | 500-1000ms | < 100ms | **80-90%** |
| **属性切换响应** | 100-500ms  | < 50ms  | **50-90%** |
| **代码行数**   | ~500 行     | ~200 行  | **60% 减少** |
| **内存占用**   | 高          | 低       | **显著降低**   |
| **图片切换体验** | 卡顿         | 平滑动画    | **显著提升**   |

### 7.2 业务收益

| 收益类型      | 描述                      |
|-----------|-------------------------|
| **用户体验**  | 属性切换即时响应，图片平滑切换，提升购买转化率 |
| **服务器负载** | 减少客户端计算，降低服务器压力         |
| **可维护性**  | 代码简化，便于后续开发和维护          |
| **扩展性**   | 支持更多 SKU，无需担心性能问题       |

---

## 八、后续优化建议

### 8.1 进阶优化

| 优化方向               | 描述            | 优先级 |
|--------------------|---------------|-----|
| **WebSocket 实时更新** | SKU 变化时实时推送   | 中   |
| **边缘计算**           | 将计算部署到 CDN 边缘 | 高   |
| **机器学习预测**         | 根据用户行为预测默认选择  | 低   |
| **A/B 测试框架**       | 支持不同算法对比      | 中   |
| **图片优化**           | WebP 格式、响应式图片 | 高   |

### 8.2 监控建议

| 监控指标        | 告警阈值    |
|-------------|---------|
| API 响应时间    | > 100ms |
| 缓存命中率       | < 90%   |
| 错误率         | > 1%    |
| P95 响应时间    | > 200ms |
| **图片加载失败率** | > 5%    |

---

## 附录：兼容性矩阵生成算法详解

### A.1 算法原理

兼容性矩阵的核心思想是**预计算所有可能的属性组合**，将运行时的复杂计算转换为 O(1) 的查表操作。

### A.2 位掩码生成子集

```typescript
// 假设有 3 个属性: [A, B, C]
// 使用位掩码生成所有非空子集:
// 001 → [A]
// 010 → [B]
// 011 → [A, B]
// 100 → [C]
// 101 → [A, C]
// 110 → [B, C]
// 111 → [A, B, C]

for (let mask = 1; mask < (1 << attrPairs.length); mask++) {
  // 遍历所有非空子集
}
```

### A.3 时间复杂度分析

| 操作     | 复杂度        | 说明           |
|--------|------------|--------------|
| 生成子集   | O(2^n)     | n=属性数，通常 n≤5 |
| 遍历 SKU | O(m)       | m=SKU数       |
| 总复杂度   | O(m × 2^n) | 服务端预计算，可接受   |

---

**文档版本**: v1.1  
**创建时间**: 2026-07-08  
**更新内容**: 添加属性切换时的产品图片控制功能  
**作者**: 技术团队  
**适用范围**: VariantSelector 性能优化实施参考