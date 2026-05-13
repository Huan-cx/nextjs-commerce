"use client";

import {useState} from "react";
import {Button, Chip, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs} from "@heroui/react";
import {getOrders} from "@utils/api/trade";
import {fenToYuan} from "@utils/formatNumber";
import {useQuery} from "@tanstack/react-query";
import {useTranslations} from "next-intl";

interface OrdersProps {
  onSelectOrder: (orderId: number | null) => void;
}

export const Orders = ({onSelectOrder}: OrdersProps) => {
  const t = useTranslations("orders");
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("title")}</h2>

      <Tabs
          variant="underlined"
          color="primary"
          selectedKey={selectedTab}
          onSelectionChange={(key) => {
            setSelectedTab(key as string);
            setPage(1);
          }}
      >
        <Tab key="all" title={t("all")}/>
        <Tab key="processing" title={t("processing")}/>
        <Tab key="completed" title={t("completed")}/>
      </Tabs>

      <Table aria-label="Orders table" removeWrapper>
        <TableHeader>
          <TableColumn>{t("orderId")}</TableColumn>
          <TableColumn>{t("date")}</TableColumn>
          <TableColumn>{t("statusLabel")}</TableColumn>
          <TableColumn>{t("total")}</TableColumn>
          <TableColumn>{t("action")}</TableColumn>
        </TableHeader>
        <TableBody
            emptyContent={isLoading ? t("loading") : t("noOrders")}
            isLoading={isLoading}
        >
          {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <span className="font-medium">#{order.no || order.id}</span>
                </TableCell>
                <TableCell>{formatDate(order.createTime)}</TableCell>
                <TableCell>
                  <Chip
                      variant="flat"
                      color={getStatusColor(order.status)}
                      size="sm"
                  >
                    {getStatusText(order.status)}
                  </Chip>
                </TableCell>
                <TableCell className="font-semibold">{fenToYuan(order.payPrice)}</TableCell>
                <TableCell>
                  <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => onSelectOrder(order.id)}
                  >
                    {t("viewDetails")}
                  </Button>
                </TableCell>
              </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
                size="sm"
                variant="flat"
                isDisabled={page === 1}
                onPress={() => setPage(page - 1)}
            >
              {t("pagination.previous")}
            </Button>
            <span className="flex items-center px-4">
              {t("pagination.page")} {page} {t("pagination.of")} {totalPages}
            </span>
            <Button
                size="sm"
                variant="flat"
                isDisabled={page === totalPages}
                onPress={() => setPage(page + 1)}
            >
              {t("pagination.next")}
            </Button>
          </div>
      )}
    </div>
  );
};