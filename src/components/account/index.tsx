"use client";

import React, {useState, useSyncExternalStore} from "react";
import {useRouter} from "next/navigation";
import {useMediaQuery} from "@utils/hooks/useMediaQueryHook";
import {AccountSidebar} from "./AccountSidebar";
import {Profile} from "./views/Profile";
import {Orders} from "./views/Orders";
import {Address} from "./views/Address";
import {UserInfo} from "@utils/api/member";

export const AccountContainer = ({userInfo, activeKey}: { userInfo: UserInfo | null, activeKey?: string }) => {
  console.log(userInfo, activeKey);
  // 1. 内部状态管理（如果是 SPA 模式使用 state，如果是路由模式则使用 usePathname）
  const [activeTab, setActiveTab] = useState(activeKey || "profile");
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const mounted = useSyncExternalStore(
      () => () => {
      },
      () => true,
      () => false,
  );

  // 2. 内容映射表：根据 key 渲染对应的独立子组件
  const renderContent = () => {

    if (!userInfo) {
      return <div className="flex items-center justify-center h-full">Failed to load user information</div>;
    }

    switch (activeTab) {
      case "profile":
        return <Profile user={userInfo}/>;
      case "orders":
        return <Orders/>;
      case "address":
        return <Address/>;
      default:
        return <Profile user={userInfo}/>;
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
      <div className="w-full min-h-screen bg-default-50/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-10 flex flex-col md:flex-row gap-4 md:gap-8 h-screen">
          {/* 左侧独立组件：传入控制状态的函数 */}
          {isDesktop && (
              <AccountSidebar
                  user={userInfo}
                  activeKey={activeTab}
                  onSelect={(key) => setActiveTab(key)}
              />
          )}
          {/* 右侧内容容器 */}
          <main className="flex-1 bg-white border border-default-100 rounded-2xl p-4 md:p-10 shadow-sm overflow-y-auto">
            {!isDesktop && (
                <div className="flex items-center gap-4 mb-4 md:hidden">
                  <button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-default-600 hover:text-default-900 transition-colors"
                      aria-label="Go back"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5"/>
                      <path d="M12 19l-7-7 7-7"/>
                    </svg>
                    <span className="font-medium">Back</span>
                  </button>
                  {/*<h2 className="flex-1 text-xl font-bold text-default-900 capitalize">{activeTab}</h2>*/}
                </div>
            )}
            {renderContent()}
          </main>
        </div>
      </div>
  );
};