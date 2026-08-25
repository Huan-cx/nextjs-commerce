## 项目概述

### 基本信息

- **项目名称**: nextjs-commerce-v3
- **技术栈**: Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Redux Toolkit
- **状态管理**: Redux Toolkit + redux-persist
- **数据获取**: TanStack React Query
- **认证方案**: NextAuth
- **国际化**: next-intl (支持 en-US, fr-FR, zh-CN)
- **UI组件库**: HeroUI (@heroui/react)
- **图标库**: lucide-react + @heroicons/react

### 核心特性

- 多语言支持 (English, French, Chinese)
- 深色/浅色主题切换
- 购物车管理
- 用户认证 (登录/注册/忘记密码)
- 商品浏览与搜索
- 订单管理
- 地址管理

---

## 目录结构

### 核心目录职责

| 目录                | 职责                      | 状态 |
|-------------------|-------------------------|----|
| `src/app/`        | Next.js App Router 页面路由 | 核心 |
| `src/components/` | 可复用 UI 组件               | 核心 |
| `src/store/`      | Redux Store 和 Slices    | 核心 |
| `src/utils/`      | 工具函数、API 调用、hooks       | 核心 |
| `src/i18n/`       | 国际化配置                   | 核心 |
| `src/providers/`  | React Context Providers | 核心 |
| `src/types/`      | TypeScript 类型定义         | 核心 |
| `src/hooks/`      | 自定义 React Hooks         | 核心 |

### 目录详解

#### src/app/

- `[locale]/` - 国际化路由
    - `(public)/` - 公共页面（首页、商品列表、搜索等）
    - `(account)/` - 用户账户页面
    - `(checkout)/` - 结账流程页面
- `api/` - API 路由
    - `auth/[...nextauth]/` - NextAuth 认证端点
    - `revalidate/` - 缓存重验证端点

#### src/components/

- `account/` - 用户账户相关组件
- `cart/` - 购物车组件
- `catalog/` - 商品目录组件（产品卡片、评论等）
- `checkout/` - 结账流程组件
- `common/` - 通用组件（按钮、表单、图标等）
- `customer/` - 用户认证组件（登录、注册等）
- `home/` - 首页组件
- `layout/` - 布局组件（导航栏、页脚）
- `theme/` - 主题相关组件

#### src/store/slices/

- `cart-slice.ts` - 购物车状态
- `user-slice.ts` - 用户状态
- `checkout-slice.ts` - 结账流程状态

---

## 编码规范

### TypeScript 规范

1. **类型定义**: 所有函数、组件、变量必须有明确的类型标注
2. **接口命名**: 使用 `I` 前缀（如 `IProduct`, `IUser`）
3. **类型文件**: 类型定义统一放在 `src/types/` 目录
4. **可选链**: 使用 `?.` 避免空值错误
5. **类型断言**: 尽量使用类型守卫而非 `as` 断言
6. **枚举命名**: 使用 PascalCase（如 `enum UserRole`）
7. **类型导出**: 优先使用 `export type` 而非 `export interface`

### React 规范

1. **组件命名**: PascalCase，文件名为组件名
2. **函数组件**: 使用箭头函数或 `function` 声明
3. **Props 定义**: 使用 `interface` 定义 props 类型
4. **Hook 规则**: 遵循 React Hooks 规则（只在顶层调用）
5. **自定义 Hook**: 使用 `use` 前缀（如 `useCart`, `useAuth`）
6. **组件拆分**: 复杂组件拆分为多个小组件
7. **受控组件**: 表单优先使用受控组件

### 代码风格

1. **缩进**: 2 空格
2. **引号**: 单引号 `'`（JSX 属性使用双引号 `"`）
3. **分号**: 必须使用分号
4. **最大行宽**: 100 字符
5. **空行**: 函数、类、条件块之间使用空行分隔
6. **空格**: 运算符前后有空格，逗号后有空格
7. **大括号**: 左大括号与语句同行

### 文件命名

| 类型     | 命名规则               | 示例                |
|--------|--------------------|-------------------|
| 组件     | PascalCase         | `ProductCard.tsx` |
| 工具函数   | camelCase          | `formatNumber.ts` |
| 类型定义   | PascalCase + `.ts` | `Product.ts`      |
| 页面路由   | `page.tsx`         | `page.tsx`        |
| Layout | `layout.tsx`       | `layout.tsx`      |
| Error  | `error.tsx`        | `error.tsx`       |

---

## 状态管理

### Redux 使用规范

1. **Slice 定义**: 每个 slice 包含 `name`, `initialState`, `reducers`
2. **异步操作**: 使用 `createAsyncThunk` 处理异步逻辑
3. **状态持久化**: 通过 `redux-persist` 持久化到 localStorage
4. **选择器**: 使用 `createSelector` 优化性能
5. **Action 命名**: 使用 `sliceName/actionName` 格式
6. **状态设计**: 保持状态扁平化，避免深层嵌套

### 状态结构

```typescript
interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  error: string | null;
}

interface UserState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

---

## 数据获取

### React Query 规范

1. **Query Key**: 使用数组格式，便于缓存管理
2. **缓存策略**: 根据数据更新频率设置合适的 `staleTime`
3. **错误处理**: 统一处理 API 错误
4. **数据预取**: 使用 `prefetchQuery` 优化首屏加载
5. **SWR**: 使用 `keepPreviousData` 实现平滑过渡
6. **Mutation**: 使用 `useMutation` 处理数据更新

### API 调用规范

1. **统一请求封装**: 使用 `src/utils/request/request.ts`
2. **错误处理**: 统一的错误处理逻辑
3. **API 路径**: 集中管理在 `src/utils/api/` 目录
4. **请求配置**: 设置统一的超时时间和重试策略
5. **响应处理**: 统一解析响应数据结构

---

## HTTP 请求规范

### 请求方法

| 方法     | 用途         |
|--------|------------|
| GET    | 获取数据       |
| POST   | 创建资源       |
| PUT    | 更新资源（完整替换） |
| PATCH  | 更新资源（部分更新） |
| DELETE | 删除资源       |

### 请求格式

1. **Content-Type**: `application/json`
2. **请求体**: 使用 JSON 格式
3. **参数传递**: GET 请求使用 query 参数，POST/PUT 使用 body

### 错误处理

1. **HTTP 状态码**: 根据状态码分类处理
2. **错误响应格式**:
   ```json
   {
     "status": "error",
     "message": "错误描述",
     "code": "错误码"
   }
   ```
3. **超时处理**: 设置合理的超时时间（默认 10 秒）

---

## 国际化

### 语言支持

| 语言      | 代码    | 文件路径                        |
|---------|-------|-----------------------------|
| English | en-US | `src/i18n/langs/en-US.json` |
| French  | fr-FR | `src/i18n/langs/fr-FR.json` |
| Chinese | zh-CN | `src/i18n/langs/zh-CN.json` |

### 使用规范

1. **翻译键**: 使用点号分隔层级（如 `home.welcome`）
2. **动态内容**: 使用 `{variable}` 占位符
3. **复数处理**: 使用 `plural` 格式处理复数
4. **翻译工具**: 使用 `useTranslations()` hook 获取翻译
5. **命名空间**: 按页面或功能模块组织翻译键

---

## 主题系统

### 主题配置

- **支持模式**: 浅色 (light)、深色 (dark)、系统 (system)
- **主题切换**: 通过 `next-themes` 实现
- **CSS 变量**: 使用 Tailwind CSS 4 的主题变量

### 使用规范

1. **主题判断**: 使用 `useTheme()` hook
2. **条件样式**: 使用 `clsx` 结合主题状态
3. **主题色**: 通过 Tailwind 类名实现（如 `bg-primary`）
4. **自定义属性**: 使用 `data-theme` 属性标记主题状态

---

## 路由规范

### 页面路由

| 路径                         | 组件位置                                                         | 说明   |
|----------------------------|--------------------------------------------------------------|------|
| `/`                        | `src/app/[locale]/(public)/page.tsx`                         | 首页   |
| `/category/[slug]`         | `src/app/[locale]/(public)/category/[slug]/page.tsx`         | 分类页  |
| `/product/[...urlProduct]` | `src/app/[locale]/(public)/product/[...urlProduct]/page.tsx` | 商品详情 |
| `/search`                  | `src/app/[locale]/(public)/search/page.tsx`                  | 搜索页  |
| `/customer/login`          | `src/app/[locale]/(public)/customer/login/page.tsx`          | 登录   |
| `/customer/register`       | `src/app/[locale]/(public)/customer/register/page.tsx`       | 注册   |
| `/account/[page]`          | `src/app/[locale]/(account)/account/[page]/page.tsx`         | 用户账户 |
| `/checkout`                | `src/app/[locale]/(checkout)/checkout/page.tsx`              | 结账   |

### 路由导航

1. **链接**: 使用 `next/link` 的 `Link` 组件
2. **动态路由**: 使用 `useParams()` 获取参数
3. **国际化路由**: 通过 `next-intl` 自动处理语言前缀
4. **编程式导航**: 使用 `useRouter()` hook

---

## 组件分类

### 组件层级

1. **布局组件** - `src/components/layout/`
2. **页面组件** - `src/components/home/`, `src/components/account/` 等
3. **功能组件** - `src/components/cart/`, `src/components/checkout/` 等
4. **通用组件** - `src/components/common/`
5. **UI 基础组件** - `src/components/theme/ui/`

### 组件复用原则

1. **单一职责**: 每个组件只负责一个功能
2. **可组合性**: 通过 props 组合实现复杂功能
3. **无状态优先**: 优先使用纯函数组件
4. **可测试性**: 组件应易于单元测试
5. **可配置性**: 通过 props 提供灵活配置

---

## 样式规范

### Tailwind CSS 4

1. **配置文件**: `tailwindcss` 和 `@tailwindcss/postcss`
2. **主题变量**: 在 `src/app/globals.css` 中定义
3. **类名顺序**: 先布局类，再颜色类，最后响应式类
4. **自定义类**: 使用 `@theme` 块定义自定义主题变量

### 自定义样式

1. **CSS 文件**: 使用 `.module.css` 或内联样式
2. **动画**: 使用 `framer-motion` 实现复杂动画
3. **响应式**: 使用 Tailwind 的响应式断点（sm, md, lg, xl, 2xl）
4. **样式优先级**: 避免使用 `!important`

---

## 错误处理

### 全局错误边界

1. **Error Boundary**: `src/components/error/ErrorBoundary.tsx`
2. **页面错误**: 使用 `error.tsx` 处理页面级错误
3. **404 处理**: 使用 `not-found.tsx`

### API 错误处理

1. **统一错误格式**: 所有 API 返回统一的错误结构
2. **Toast 提示**: 使用 `useToast` hook 显示错误信息
3. **重试机制**: 关键操作实现自动重试
4. **错误日志**: 记录错误信息便于排查

---

## 安全规范

### 认证安全

1. **JWT 管理**: 使用 HttpOnly cookie 存储 token
2. **会话管理**: 定期刷新 token
3. **权限检查**: 敏感路由进行权限验证

### 数据安全

1. **输入验证**: 对用户输入进行严格验证
2. **XSS 防护**: 使用 React 的自动转义机制
3. **CSRF 防护**: 使用 NextAuth 的 CSRF 保护

### API 安全

1. **接口鉴权**: 敏感接口需要认证
2. **参数校验**: 对 API 参数进行校验
3. **请求频率限制**: 防止恶意请求

---

## 性能优化

### 代码分割

1. **动态导入**: 使用 `next/dynamic` 懒加载组件
2. **页面级分割**: Next.js 自动进行页面级代码分割
3. **组件级分割**: 对大型组件进行按需加载

### 缓存策略

1. **React Query 缓存**: 设置合理的缓存时间
2. **图片优化**: 使用 `next/image` 组件
3. **静态生成**: 对静态页面使用 `generateStaticParams`
4. **CDN 缓存**: 静态资源使用 CDN 加速

---

## 开发流程

### 开发命令

| 命令                 | 说明       |
|--------------------|----------|
| `npm run dev`      | 启动开发服务器  |
| `npm run build`    | 构建生产版本   |
| `npm run start`    | 启动生产服务器  |
| `npm run lint`     | 代码检查     |
| `npm run lint:fix` | 自动修复代码问题 |

### 提交规范

1. **commit 格式**: `<type>: <description>`
2. **type 类型**: feat, fix, docs, style, refactor, test, chore
3. **描述**: 简洁清晰，说明改动内容

### 分支策略

1. **main**: 主分支，稳定版本
2. **develop**: 开发分支，日常开发
3. **feature/**: 功能分支，开发新功能
4. **bugfix/**: 修复分支，修复 bug

---

## 环境配置

### 环境变量

- **开发环境**: `.env.local`
- **示例配置**: `.env.example`

### 必要变量

```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_STOREFRONT_TOKEN=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

---

## 第三方集成

### 已集成服务

| 服务            | 包名                      | 用途    |
|---------------|-------------------------|-------|
| NextAuth      | `next-auth`             | 用户认证  |
| React Query   | `@tanstack/react-query` | 数据缓存  |
| Redux         | `@reduxjs/toolkit`      | 状态管理  |
| next-intl     | `next-intl`             | 国际化   |
| next-themes   | `next-themes`           | 主题切换  |
| HeroUI        | `@heroui/react`         | UI 组件 |
| framer-motion | `framer-motion`         | 动画    |
| clsx          | `clsx`                  | 类名合并  |
| lodash        | `lodash`                | 工具函数  |

---

## 注意事项

1. **Node.js 版本**: 建议使用 LTS 版本（20+）
2. **TypeScript 严格模式**: 项目启用严格类型检查
3. **ESLint 规则**: 严格遵循 `eslint-config-next`
4. **构建检查**: 构建前自动执行 lint 检查
5. **环境变量**: 敏感信息不要提交到版本控制

---

## 版本历史

- **v0.1.0**: 初始版本，基础电商功能