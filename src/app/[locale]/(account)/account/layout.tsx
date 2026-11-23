import {ReactNode} from "react";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

/**
 * 账户页面 Layout
 *
 * 【注意】
 * 认证保护已在上级 (account)/layout.tsx 中统一处理
 * 这里只负责渲染通用 UI 布局
 */
export default function AccountLayout({
                                        children,
                                      }: {
  children: ReactNode;
}) {
  return (
      <main>
        <Navbar/>
        <div className="mx-auto min-h-[calc(100vh-580px)] w-full">
          {children}
        </div>
        <Footer/>
      </main>
  );
}
