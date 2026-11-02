# 巨型菜单系统使用指南

## 概述

该系统实现了可切换的多模板菜单系统，适用于不同场景和需求。所有模板都支持响应式设计和国际化。

## 模板类型

### 1. Enhanced B2B 模板 (推荐)

- **适用场景**: B2B电商平台，多级分类展示
- **特点**:
    - 三级联动分类结构
    - 左侧一级分类，右侧二三级分类展示
    - B2B服务快速入口
    - 使用HeroUI组件增强视觉效果
- **使用方法**: `<MegaMenu template="enhanced-b2b" />`

### 2. B2B 模板

- **适用场景**: B2B电商平台的标准模板
- **特点**:
    - 三级联动分类结构
    - 简洁的UI设计
- **使用方法**: `<MegaMenu template="b2b" />`

### 3. 电商模板

- **适用场景**: 普通电商平台
- **特点**:
    - 简单下拉菜单
    - 适合二级分类
- **使用方法**: `<MegaMenu template="ecommerce" />`

### 4. 简约模板

- **适用场景**: 内容网站或简单导航
- **特点**:
    - 水平排列的简单链接
    - 最小化设计
- **使用方法**: `<MegaMenu template="simple" />`

## 配置选项

### maxLevel

- **类型**: `number`
- **默认值**: `3`
- **作用**: 控制展示的分类层级深度

### template

- **类型**: `'enhanced-b2b' | 'b2b' | 'ecommerce' | 'simple'`
- **默认值**: `'enhanced-b2b'`
- **作用**: 指定使用的菜单模板

## 实现细节

### 响应式设计

- **桌面端** (>1024px): 显示完整菜单
- **平板端** (768px-1024px): 简化菜单
- **移动端** (<768px): 折叠菜单，通过汉堡菜单访问

### 性能优化

- 使用React Query缓存分类数据
- 菜单数据懒加载
- 动画效果优化

### 国际化支持

- 支持多种语言的分类名称
- 与next-intl集成

## 扩展新模板

要创建新模板，请遵循以下步骤：

1. 在 `templates` 目录中创建新模板文件
2. 导入所需组件和类型
3. 遵循模板接口约定
4. 在 `templates/index.ts` 中导出新模板
5. 在 `MegaMenuBase.tsx` 中添加模板选择逻辑

### 模板接口示例

```tsx
interface TemplateProps {
  categories: Category[];
  hoveredCategory: number | null;
  setHoveredCategory: (id: number | null) => void;
  maxLevel: number;
}

export default function NewTemplate({
                                      categories,
                                      hoveredCategory,
                                      setHoveredCategory,
                                      maxLevel
                                    }: TemplateProps) {
  // 模板实现
}
```

## 组件结构

```
MegaMenu/
├── MegaMenuBase.tsx     # 主组件逻辑
├── templates/           # 模板目录
│   ├── B2BTemplate.tsx
│   ├── EnhancedB2BTemplate.tsx
│   ├── EcommerceTemplate.tsx
│   ├── SimpleTemplate.tsx
│   └── index.ts
└── index.ts             # 导出入口
```

## 使用示例

### 基本使用

```tsx
import MegaMenu from '@/components/layout/navbar/MegaMenu';

<MegaMenu/>
```

### 自定义配置

```tsx
<MegaMenu
    template="enhanced-b2b"
    maxLevel={4}
/>
```

## 注意事项

1. 确保分类数据结构正确（支持多层级）
2. 考虑移动端体验，合理设置 maxLevel
3. 使用 HeroUI 组件时注意主题一致性
4. 测试不同屏幕尺寸下的显示效果