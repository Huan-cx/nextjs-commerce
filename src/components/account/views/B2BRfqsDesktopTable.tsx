"use client";

import {Button, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/react";
import {ChevronRight} from "lucide-react";
import {RfqStatus} from "@/types/api/b2b";

interface B2BRfqsDesktopTableProps {
  rfqs: any[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  t: (key: string) => string;
  onSelectRfq: (rfqId: number | null) => void;
  onPageChange: (page: number) => void;
}

const getStatusColor = (status: number) => {
  if (status === RfqStatus.ORDERED) return "primary";
  if (status === RfqStatus.QUOTED) return "success";
  if (status === RfqStatus.INQUIRING) return "warning";
  if (status === RfqStatus.EXPIRED || status === RfqStatus.CANCELED) return "danger";
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

export const B2BRfqsDesktopTable = ({
                                      rfqs,
                                      isLoading,
                                      page,
                                      totalPages,
                                      t,
                                      onSelectRfq,
                                      onPageChange,
                                    }: B2BRfqsDesktopTableProps) => (
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
                      onPress={() => onPageChange(page - 1)}
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
                      onPress={() => onPageChange(page + 1)}
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