"use client";

import {useState} from "react";
import {
  Button,
  Chip,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  User
} from "@heroui/react";
import {ChevronRight, FileText} from "lucide-react";
import {B2BRfqListResponse, getRfqList} from "@utils/api/b2b";
import {RfqStatus} from "@/types/api/b2b";
import {useQuery} from "@tanstack/react-query";
import {useTranslations} from "next-intl";
import {useMediaQuery} from "@utils/hooks/useMediaQueryHook";

interface B2BRfqsProps {
  onSelectRfq: (rfqId: number | null) => void;
}

export const B2BRfqs = ({onSelectRfq}: B2BRfqsProps) => {
  const t = useTranslations("b2b.rfq");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [selectedTab, setSelectedTab] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Tab和状态精确对应：pending=1, quoted=2, expired=3, canceled=4, ordered=5
  const getStatusListByTab = (tab: string): number[] | undefined => {
    switch (tab) {
      case "pending":
        return [RfqStatus.INQUIRING];
      case "quoted":
        return [RfqStatus.QUOTED];
      case "expired":
        return [RfqStatus.EXPIRED];
      case "canceled":
        return [RfqStatus.CANCELED];
      case "ordered":
        return [RfqStatus.ORDERED];
      default:
        return undefined;
    }
  };

  const {data: ordersData, isLoading} = useQuery<B2BRfqListResponse>({
    queryKey: ["b2bRfqs", selectedTab, page],
    queryFn: () => getRfqList({
      pageNo: page,
      pageSize,
      statusList: getStatusListByTab(selectedTab),
    }),
  });

  const rfqs = ordersData?.list || [];
  const totalCount = ordersData?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const getStatusColor = (status: number) => {
    if (status === RfqStatus.ORDERED) return "primary";   // 已下单 - 蓝色（醒目）
    if (status === RfqStatus.QUOTED) return "success";     // 已报价 - 绿色
    if (status === RfqStatus.INQUIRING) return "warning";   // 询价中 - 橙色
    if (status === RfqStatus.EXPIRED || status === RfqStatus.CANCELED) return "danger"; // 已过期/已取消 - 红色
    return "default";
  };

  const getStatusKey = (status: number) => {
    switch (status) {
      case RfqStatus.INQUIRING:
        return "inquiring";
      case RfqStatus.QUOTED:
        return "quoted";
      case RfqStatus.EXPIRED:
        return "expired";
      case RfqStatus.CANCELED:
        return "canceled";
      case RfqStatus.ORDERED:
        return "ordered";
      default:
        return "unknown";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 移动端询价单卡片
  const RfqCard = ({rfq}: { rfq: any }) => {
    const handleClick = () => {
      console.log('RFQ clicked:', rfq.id);
      onSelectRfq(rfq.id);
    };

    return (
      <div
          className="bg-white border border-default-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98]"
          onClick={handleClick}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-default-900">#{rfq.no || rfq.id}</p>
            <p className="text-tiny text-default-400">{formatDate(rfq.createTime)}</p>
          </div>
          <Chip variant="flat" color={getStatusColor(rfq.status)} size="sm">
            {t(`status.${getStatusKey(rfq.status)}`)}
          </Chip>
        </div>

        <div className="border-t border-default-50 pt-3">
          <div className="flex items-center gap-2">
            {rfq.items?.slice(0, 3).map((item: any, index: number) => (
                <User
                    key={index}
                    avatarProps={{src: item.picUrl, size: "sm", radius: "md"}}
                    name={null}
                    description={null}
                    className="-ml-2 first:ml-0"
                />
            ))}
            {rfq.items?.length > 3 && (
                <span className="text-tiny text-default-400 ml-2">
                  +{rfq.items.length - 3} {t("items")}
                </span>
            )}
          </div>
          <p className="text-tiny text-default-400 mt-2">
            {rfq.items?.length || 0} {t("items")}
          </p>
        </div>

        <div className="flex justify-end items-center mt-3 pt-3 border-t border-default-50">
          <span 
            className="flex items-center gap-1 text-primary font-semibold text-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <FileText size={16}/>
            <span>{t("viewDetails")}</span>
            <ChevronRight size={16}/>
          </span>
        </div>
      </div>
    );
  };

  // 桌面端表格
  const DesktopTable = () => (
      <Table
          isStriped
          isHeaderSticky
          aria-label={t("title")}
          classNames={{
            wrapper: "min-h-[300px]",
          }}
          bottomContent={
            totalPages > 0 ? (
                <div className="flex w-full justify-center">
                  <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="flat"
                        isDisabled={page === 1}
                        onPress={() => setPage(page - 1)}
                    >
                      {t("pagination.previous")}
                    </Button>
                    <span className="text-sm text-default-500 px-4">
                      {t("pagination.page")} {page} / {totalPages}
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
                </div>
            ) : null
          }
      >
        <TableHeader>
          <TableColumn>{t("columns.rfqNo")}</TableColumn>
          <TableColumn>{t("columns.items")}</TableColumn>
          <TableColumn>{t("columns.date")}</TableColumn>
          <TableColumn>{t("columns.status")}</TableColumn>
          <TableColumn>{t("columns.action")}</TableColumn>
        </TableHeader>
        <TableBody
            items={rfqs}
            isLoading={isLoading}
            loadingContent={<div className="py-10 text-center">{t("loading")}</div>}
            emptyContent={<div className="py-10 text-center text-default-500">{t("noData")}</div>}
        >
          {(rfq: any) => (
              <TableRow
                  key={rfq.id}
                  className="cursor-pointer hover:bg-default-100"
                  onClick={() => onSelectRfq(rfq.id)}
              >
                <TableCell className="font-medium">#{rfq.no || rfq.id}</TableCell>
                <TableCell>{rfq.items?.length || 0} {t("items")}</TableCell>
                <TableCell>{formatDate(rfq.createTime)}</TableCell>
                <TableCell>
                  <Chip variant="flat" color={getStatusColor(rfq.status)} size="sm">
                    {t(`status.${getStatusKey(rfq.status)}`)}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      endContent={<ChevronRight size={16}/>}
                      onPress={() => onSelectRfq(rfq.id)}
                  >
                    {t("viewDetails")}
                  </Button>
                </TableCell>
              </TableRow>
          )}
        </TableBody>
      </Table>
  );

  return (
      <div className="w-full">
        {/* Tab 筛选 */}
        <div className="mb-6">
          <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => {
                setSelectedTab(String(key));
                setPage(1);
              }}
              size="md"
              variant="underlined"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-default-200",
                cursor: "w-full bg-primary",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-primary",
              }}
              aria-label="询价单状态筛选"
          >
            <Tab key="all" title={t("tabs.all")}/>
            <Tab key="pending" title={t("tabs.pending")}/>
            <Tab key="quoted" title={t("tabs.quoted")}/>
            <Tab key="expired" title={t("tabs.expired")}/>
            <Tab key="canceled" title={t("tabs.canceled")}/>
            <Tab key="ordered" title={t("tabs.ordered")}/>
          </Tabs>
        </div>

        {/* 内容区 */}
        <div className="mt-4">
          {isDesktop ? (
              <DesktopTable/>
          ) : (
              <div className="flex flex-col gap-4">
                {isLoading ? (
                    <div className="py-10 text-center">{t("loading")}</div>
                ) : rfqs.length === 0 ? (
                    <div className="py-10 text-center text-default-500">{t("noData")}</div>
                ) : (
                    rfqs.map((rfq) => <RfqCard key={rfq.id} rfq={rfq}/>)
                )}
              </div>
          )}
        </div>
      </div>
  );
};