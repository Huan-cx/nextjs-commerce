"use client";

import React, {useState} from "react";
import {useMediaQuery} from "@utils/hooks/useMediaQueryHook";
import {AccountSidebar} from "./AccountSidebar";
import {Profile} from "./views/Profile";
import {Orders} from "./views/Orders";
import {Address} from "./views/Address";
import {UserInfo} from "@utils/api/member";

export const AccountContainer = ({userInfo, activeKey}: { userInfo: UserInfo | null, activeKey?: string }) => {
  // 1. 内部状态管理（如果是 SPA 模式使用 state，如果是路由模式则使用 usePathname）
  const [activeTab, setActiveTab] = useState(activeKey || "profile");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

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
          <main className="flex-1 bg-white border border-default-100 rounded-2xl p-4 md:p-10 shadow-sm overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
  );
};