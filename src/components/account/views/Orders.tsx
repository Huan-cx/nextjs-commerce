"use client";

import {useState} from "react";
import {Button, Chip, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs} from "@heroui/react";
import {ChevronRight, Package} from "lucide-react";
import {getOrders} from "@utils/api/trade";
import {fenToYuan} from "@utils/formatNumber";
import {useQuery} from "@tanstack/react-query";
import {useTranslations} from "next-intl";
import {useMediaQuery} from "@utils/hooks/useMediaQueryHook";

interface OrdersProps {
  onSelectOrder: (orderId: number | null) => void;
}

export const Orders = ({onSelectOrder}: OrdersProps) => {
  const t = useTranslations("orders");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [selectedTab, setSelectedTab] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {data: ordersData, isLoading} = useQuery({
    queryKey: ["orders", selectedTab, page],
    queryFn: () => getOrders({
      pageNo: page,
      pageSize,
      status: selectedTab === "all" ? undefined : selectedTab === "completed" ? 30 : undefined,
    }),
  });

  const orders = ordersData?.list || [];
  const total = ordersData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const getStatusColor = (status: number) => {
    if (status === 30) return "success";
    if (status === 0 || status === 10) return "warning";
    return "default";
  };

  const getStatusText = (status: number) => {
    if (status === 0) return t("status.pending");
    if (status === 10) return t("status.unpaid");
    if (status === 20) return t("status.shipped");
    if (status === 30) return t("status.completed");
    if (status === 40) return t("status.cancelled");
    return t("status.unknown");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 移动端订单卡片
  const OrderCard = ({order}: { order: any }) => (
      <div
          className="bg-white border border-default-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98]"
          onClick={() => onSelectOrder(order.id)}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-default-900">#{order.no || order.id}</p>
            <p className="text-tiny text-default-400">{formatDate(order.createTime)}</p>
          </div>
          <Chip variant="flat" color={getStatusColor(order.status)} size="sm">
            {getStatusText(order.status)}
          </Chip>
        </div>

        <div className="border-t border-default-50 pt-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-default-400"/>
              <span className="text-sm text-default-600">
                {order.productCount || 0} {t("productCount")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-default-50">
          <div>
            <p className="text-tiny text-default-400">{t("total")}</p>
            <p className="font-bold text-default-900">{fenToYuan(order.payPrice)}</p>
          </div>
          <div className="flex items-center gap-1 text-primary font-semibold text-sm">
            {t("viewDetails")}
            <ChevronRight size={16}/>
          </div>
        </div>
      </div>
  );

  return (
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold text-default-900">{t("title")}</h2>
        </div>

        {/* 选项卡导航 */}
        <Tabs
            variant="underlined"
            color="primary"
            selectedKey={selectedTab}
            onSelectionChange={(key) => {
              setSelectedTab(key as string);
              setPage(1);
            }}
            classNames={{
              tabList: "gap-4",
              tab: "px-1 h-10",
              tabContent: "text-sm font-semibold",
              cursor: "h-0.5",
            }}
        >
          <Tab key="all" title={t("all")}/>
          <Tab key="processing" title={t("processing")}/>
          <Tab key="completed" title={t("completed")}/>
        </Tabs>

        {/* 加载状态 */}
        {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
            </div>
        )}

        {/* 空状态 */}
        {!isLoading && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-default-400">
              <Package size={48} className="mb-4 opacity-50"/>
              <p className="text-lg font-medium">{t("noOrders")}</p>
            </div>
        )}

        {/* 桌面端表格布局 */}
        {isDesktop && !isLoading && orders.length > 0 && (
            <Table aria-label="Orders table" removeWrapper classNames={{
              th: "bg-default-50 text-default-600 font-bold text-xs uppercase tracking-wider h-12",
              td: "py-4 border-b border-default-100",
            }}>
              <TableHeader>
                <TableColumn>{t("orderId")}</TableColumn>
                <TableColumn>{t("date")}</TableColumn>
                <TableColumn>{t("productCount") || "商品数"}</TableColumn>
                <TableColumn>{t("statusLabel")}</TableColumn>
                <TableColumn>{t("total")}</TableColumn>
                <TableColumn>{t("action")}</TableColumn>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-default-50 transition-colors">
                      <TableCell>
                        <span className="font-semibold text-default-900">#{order.no || order.id}</span>
                      </TableCell>
                      <TableCell className="text-default-600">{formatDate(order.createTime)}</TableCell>
                      <TableCell className="text-default-600">{order.productCount || 0}</TableCell>
                      <TableCell>
                        <Chip variant="flat" color={getStatusColor(order.status)} size="sm">
                          {getStatusText(order.status)}
                        </Chip>
                      </TableCell>
                      <TableCell className="font-bold text-default-900">{fenToYuan(order.payPrice)}</TableCell>
                      <TableCell>
                        <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => onSelectOrder(order.id)}
                            className="font-semibold"
                        >
                          {t("viewDetails")}
                        </Button>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
        )}

        {/* 移动端卡片布局 */}
        {!isDesktop && !isLoading && orders.length > 0 && (
            <div className="space-y-3">
              {orders.map((order) => (
                  <OrderCard key={order.id} order={order}/>
              ))}
            </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <Button
                  size="sm"
                  variant="flat"
                  isDisabled={page === 1}
                  onPress={() => setPage(page - 1)}
                  className="font-medium"
              >
                {t("pagination.previous")}
              </Button>
              <span className="text-sm text-default-500 px-4">
                {t("pagination.page")} {page} {t("pagination.of")} {totalPages}
              </span>
              <Button
                  size="sm"
                  variant="flat"
                  isDisabled={page === totalPages}
                  onPress={() => setPage(page + 1)}
                  className="font-medium"
              >
                {t("pagination.next")}
              </Button>
            </div>
        )}
      </div>
  );
};
