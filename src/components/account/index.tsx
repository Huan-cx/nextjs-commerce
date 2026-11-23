"use client";

import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useMediaQuery} from "@utils/hooks/useMediaQueryHook";
import {AccountSidebar} from "./AccountSidebar";
import {Profile} from "./views/Profile";
import {Orders} from "./views/Orders";
import {Address} from "./views/Address";
import {OrderDetailView} from "./views/OrderDetail";
import {B2BRfqs} from "./views/B2BRfqs";
import {B2BRfqDetailView} from "./views/B2BRfqDetailView";
import {B2BQuotationDetailView} from "./views/B2BQuotationDetailView";
import {B2BOrderConfirmationView} from "./views/B2BOrderConfirmationView";
import {UserInfo} from "@utils/api/member";
import {OrderDetail} from "@utils/api/trade";
import {useQuery} from "@tanstack/react-query";
import {useLocale, useTranslations} from "next-intl";
import {Avatar, Tab, Tabs} from "@heroui/react";
import {FileText, MapPin, Package, User} from "lucide-react";

export const AccountContainer = ({userInfo, activeKey, quotationId}: {
  userInfo: UserInfo | null;
  activeKey?: string;
  quotationId?: number;
}) => {
  const t = useTranslations("account");
  const tSidebar = useTranslations("accountSidebar");
  const locale = useLocale();  // ✅ 获取当前语言，用于 i18n 路由
  // 1. 内部状态管理（如果是 SPA 模式使用 state，如果是路由模式则使用 usePathname）
  const [activeTab, setActiveTab] = useState(activeKey || "profile");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedRfqId, setSelectedRfqId] = useState<number | null>(null);
  const [viewQuotation, setViewQuotation] = useState(false);
  const [confirmingQuotationId, setConfirmingQuotationId] = useState<number | null>(quotationId || null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();

  // 当activeTab变化时，重置选中状态
  useEffect(() => {
    if (activeTab !== "orders") {
      setSelectedOrderId(null);
    }
    if (activeTab !== "b2b-rfq" && activeTab !== "b2b-order-confirmation") {
      setSelectedRfqId(null);
      setViewQuotation(false);
      setConfirmingQuotationId(null);
    }
  }, [activeTab]);

  // 获取订单详情数据
  const {data: orderData} = useQuery({
    queryKey: ["orderDetail", selectedOrderId],
    queryFn: async () => {
      if (!selectedOrderId) return null;
      const {getOrderDetail} = await import("@utils/api/trade");
      return getOrderDetail(selectedOrderId);
    },
    enabled: !!selectedOrderId,
  });

  // 获取询价单详情数据（用于获取状态）
  const {data: rfqData} = useQuery({
    queryKey: ["b2bRfqDetail", selectedRfqId],
    queryFn: async () => {
      if (!selectedRfqId) return null;
      const {getRfqDetail} = await import("@utils/api/b2b");
      return getRfqDetail(selectedRfqId);
    },
    enabled: !!selectedRfqId,
  });

  // 2. 内容映射表：根据 key 渲染对应的独立子组件
  const renderContent = () => {
    if (!userInfo) {
      return <div className="flex items-center justify-center h-full">{t("loadFailed")}</div>;
    }

    // 如果选择了订单详情，显示订单详情
    if (activeTab === "orders" && selectedOrderId) {
      if (!orderData) {
        return (
            <div className="max-w-6xl mx-auto p-6">
              <p>{t("loadingOrderDetails")}</p>
            </div>
        );
      }
      return (
          <OrderDetailView
              data={orderData as OrderDetail}
              onBack={() => setSelectedOrderId(null)}
          />
      );
    }

    // B2B 订单确认页
    if (activeTab === "b2b-order-confirmation" && confirmingQuotationId) {
      return (
          <B2BOrderConfirmationView
              rfqId={confirmingQuotationId}
              onBack={() => {
                setConfirmingQuotationId(null);
                // ✅ 返回时同时切换回询价详情页
                setActiveTab("b2b-rfq");
                setSelectedRfqId(confirmingQuotationId);
                setViewQuotation(true);
              }}
          />
      );
    }

    // B2B 询价单详情
    if (activeTab === "b2b-rfq" && selectedRfqId) {
      if (viewQuotation) {
        return (
            <B2BQuotationDetailView
                rfqId={selectedRfqId}
                rfqStatus={rfqData?.status || 0}
                onBack={() => setViewQuotation(false)}
                onConfirmOrder={(rfqIdVal) => {
                  setConfirmingQuotationId(rfqIdVal);
                  setActiveTab("b2b-order-confirmation");
                }}
            />
        );
      }
      return (
          <B2BRfqDetailView
              rfqId={selectedRfqId}
              onBack={() => setSelectedRfqId(null)}
              onViewQuotation={() => setViewQuotation(true)}
          />
      );
    }

    switch (activeTab) {
      case "profile":
        return <Profile user={userInfo}/>;
      case "orders":
        return <Orders onSelectOrder={setSelectedOrderId}/>;
      case "address":
        return <Address/>;
      case "b2b-rfq":
        return <B2BRfqs onSelectRfq={setSelectedRfqId}/>;
      default:
        return <Profile user={userInfo}/>;
    }
  };

  // 移动端顶部用户信息卡片
  const MobileUserHeader = () => (
      <div
          className="md:hidden flex items-center gap-3 p-4 mb-4 bg-white rounded-xl border border-default-100 shadow-sm">
        <Avatar
            isBordered
            color="primary"
            radius="full"
            size="md"
            src={userInfo?.avatar}
            className="flex-shrink-0"
            showFallback
            fallback={<User size={18}/>}
        />
        <div className="flex flex-col truncate min-w-0">
          <h4 className="font-bold text-default-900 truncate text-sm">
            {tSidebar("hello")} {userInfo?.nickname || tSidebar("user")}
          </h4>
          <p className="text-tiny text-default-400 truncate">{userInfo?.email}</p>
        </div>
      </div>
  );

  // 移动端顶部标签导航 - 替代侧边栏
  const MobileTabNavigation = () => {
    const tabItems = [
      {key: "profile", label: tSidebar("profile"), icon: <User size={16}/>},
      {key: "address", label: tSidebar("address"), icon: <MapPin size={16}/>},
      {key: "b2b-rfq", label: tSidebar("b2bRfq"), icon: <FileText size={16}/>},
      {key: "orders", label: tSidebar("orders"), icon: <Package size={16}/>},
    ];

    return (
        <div className="md:hidden mb-4">
          <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => {
                if (isDesktop) {
                  // ✅ 修复：必须加上 locale 前缀，否则 i18n 路由不匹配
                  router.push(`/${locale}/account/${key}`);
                } else {
                  setActiveTab(key.toString());
                  // 重置详情状态
                  setSelectedOrderId(null);
                  setSelectedRfqId(null);
                  setViewQuotation(false);
                  setConfirmingQuotationId(null);
                }
              }}
              variant="underlined"
              color="primary"
              classNames={{
                tabList: "gap-1 p-1 bg-white rounded-xl border border-default-100 shadow-sm",
                tab: "h-12 px-2 data-[selected=true]:bg-primary/10 rounded-lg",
                tabContent: "text-xs font-semibold flex items-center gap-1",
                cursor: "bg-primary rounded-lg",
              }}
          >
            {tabItems.map((item) => (
                <Tab
                    key={item.key}
                    title={
                      <div className="flex items-center gap-1">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    }
                />
            ))}
          </Tabs>
        </div>
    );
  };

  return (
      <div className="w-full min-h-screen bg-default-50/30 overflow-hidden pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-10 flex flex-col md:flex-row gap-4 md:gap-8">
          {/* 移动端用户信息卡片 */}
          <MobileUserHeader/>

          {/* 移动端顶部标签导航 - 替代侧边栏 */}
          <MobileTabNavigation/>

          {/* 左侧侧边栏 - 仅桌面端显示，订单确认页不显示 */}
          {isDesktop && activeTab !== "b2b-order-confirmation" && (
              <AccountSidebar
                  user={userInfo}
                  activeKey={activeTab}
                  onSelect={setActiveTab}
              />
          )}

          {/* 主内容区 */}
          <main className="flex-1 bg-white border border-default-100 rounded-2xl p-4 md:p-8 shadow-sm overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
  );
};