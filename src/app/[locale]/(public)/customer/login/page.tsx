import LoginForm from "@components/customer/LoginForm";
import {generateMetadataForPage} from "@utils/helper";
import {staticSeo} from "@utils/metadata";
import {Metadata} from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataForPage("", staticSeo.login);
}

/**
 * 登录页面（服务端组件）
 *
 * 【架构极简原则】
 * 不要在这里加任何 Session 检查或 redirect 逻辑！
 *
 * 历史教训：
 * ❌ getServerSession + redirect 会导致各种竞态问题
 *    - 跳转时机不可控
 *    - Hook 数量不一致报错
 *    - 服务端/客户端 Session 不同步
 *
 * ✅ 登录页应该"无脑"渲染，让客户端组件处理所有逻辑
 *    - LoginForm 里的 useSession() 是真理来源
 *    - 该跳该停都在客户端做
 *    - 服务端只负责渲染，什么都不干预
 *
 * 【登录时序保证】：NextAuth signIn 内部负责
 * 1. 提交登录请求
 * 2. 后端返回 Session Cookie
 * 3. NextAuth 前端状态更新
 * 4. redirect 到 callbackUrl
 * 5. 目标页面请求时，Cookie 一定已经在浏览器里了
 * 6. getServerSession 100% 能读到 → 没有401，没有循环
 */
export default function LoginPage() {
  // ✅ 服务端什么都不做，就渲染 LoginForm
  // LoginForm 客户端组件里的 useSession() 做所有决策
  return <LoginForm/>;
}
