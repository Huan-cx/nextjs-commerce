"use client";

import {Button, Card, CardBody, Chip, Divider, Spinner, User} from "@heroui/react";
import {ChevronLeftIcon} from "@heroicons/react/24/outline";
import {acceptQuotation, getFinalQuotation, rejectQuotation,} from "@utils/api/b2b";
import {RfqStatus} from "@/types/api/b2b";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useLocale, useTranslations} from "next-intl";
import {fenToYuan} from "@utils/formatNumber";
import {useCustomToast} from "@utils/hooks/useToast";
import {useMediaQuery} from "@utils/hooks/useMediaQueryHook";
import {useRouter} from "next/navigation";

// 统一色彩系统 - 与 OrderDetailView 保持一致
const COLORS = {
  status: {
    pending: 'warning',
    quoted: 'success',
    accepted: 'primary',
    rejected: 'danger',
    expired: 'danger',
  },
  background: {
    primary: 'bg-default-50',
    secondary: 'bg-white',
  },
  text: {
    primary: 'text-default-800',
    secondary: 'text-default-600',
    tertiary: 'text-default-400',
  },
  border: {
    light: 'border-default-100',
    medium: 'border-default-200',
  },
} as const;

interface B2BQuotationDetailViewProps {
  rfqId: number;
  rfqStatus: number;
  onBack: () => void;
  onConfirmOrder?: (rfqId: number) => void;
}

export const B2BQuotationDetailView = ({rfqId, rfqStatus, onBack, onConfirmOrder}: B2BQuotationDetailViewProps) => {
  const t = useTranslations("b2b.quotationDetail");
  const locale = useLocale();  // ✅ 获取当前语言，用于 i18n 路由
  const {showToast} = useCustomToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  useMediaQuery("(min-width: 1024px)");
  const {data: quotationData, isLoading} = useQuery({
    queryKey: ["b2bFinalQuotation", rfqId],
    queryFn: () => getFinalQuotation(rfqId),
  });

  const acceptMutation = useMutation({
    mutationFn: acceptQuotation,
    onSuccess: () => {
      showToast(t("acceptSuccess"), "success");
      queryClient.invalidateQueries({queryKey: ["b2bFinalQuotation", rfqId]});
      queryClient.invalidateQueries({queryKey: ["b2bRfqDetail", rfqId]});
      queryClient.invalidateQueries({queryKey: ["b2bRfqs"]});
      if (onConfirmOrder) {
        onConfirmOrder(rfqId);
      } else {
        router.push(`/${locale}/account/b2b-orders`);
      }
    },
    onError: (error: Error) => {
      showToast(error.message || t("acceptFailed"), "danger");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectQuotation,
    onSuccess: () => {
      showToast(t("rejectSuccess"), "success");
      queryClient.invalidateQueries({queryKey: ["b2bFinalQuotation", rfqId]});
      queryClient.invalidateQueries({queryKey: ["b2bRfqDetail", rfqId]});
      queryClient.invalidateQueries({queryKey: ["b2bRfqs"]});
    },
    onError: (error: Error) => {
      showToast(error.message || t("rejectFailed"), "danger");
    },
  });

  const handleAccept = () => {
    acceptMutation.mutate(rfqId);
  };

  const handleReject = () => {
    rejectMutation.mutate(rfqId);
  };

  const getStatusColor = (status: number) => {
    if (status === RfqStatus.QUOTED) return COLORS.status.quoted;
    if (status === RfqStatus.INQUIRING) return COLORS.status.pending;
    if (status === RfqStatus.EXPIRED || status === RfqStatus.CANCELED) return COLORS.status.rejected;
    return COLORS.status.pending;
  };

  const getStatusText = (status: number) => {
    const statusMap: Record<number, string> = {
      [RfqStatus.INQUIRING]: t("status.inquiring"),
      [RfqStatus.QUOTED]: t("status.quoted"),
      [RfqStatus.EXPIRED]: t("status.expired"),
      [RfqStatus.CANCELED]: t("status.canceled"),
    };
    return statusMap[status] || t("status.unknown");
  };

  // 判断是否可以接受/拒绝报价（状态为已报价，且有最终报价）
  const canAcceptReject = (status: number) => {
    return status === RfqStatus.QUOTED && quotationData && quotationData.items && quotationData.items.length > 0;
  };

  // 判断是否已接受报价（有最终报价，且报价项已存在）
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading || !quotationData) {
    return (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg"/>
        </div>
    );
  }

  return (
      <div className="max-w-6xl mx-auto md:p-6 space-y-4 md:space-y-6 bg-white">
        {/* 手机端：顶部标题栏 */}
        <div className="flex md:hidden items-center gap-2 p-3 border-b border-default-100">
          <Button isIconOnly size="sm" variant="light" onPress={onBack}>
            <ChevronLeftIcon className="w-5 h-5"/>
          </Button>
          <h1 className="text-lg font-bold">{t("title")}</h1>
        </div>

        {/* 桌面端：顶部标题栏 */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button size="sm" variant="light" onPress={onBack}>
              <ChevronLeftIcon className="w-4 h-4 mr-1"/>
              {t("back")}
            </Button>
            <h2 className="text-2xl font-bold">{t("title")}</h2>
          </div>
          {canAcceptReject(rfqStatus) && (
              <div className="flex gap-2">
                <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    isLoading={rejectMutation.isPending}
                    onPress={handleReject}
                >
                  {t("reject")}
                </Button>
                <Button
                    size="sm"
                    color="primary"
                    isLoading={acceptMutation.isPending}
                    onPress={handleAccept}
                >
                  {t("accept")}
                </Button>
              </div>
          )}
        </div>

        {/* 手机端内容容器 - 简洁设计 */}
        <div className="md:hidden pb-8 space-y-0 divide-y divide-default-100">
          {/* 基本信息区块 */}
          <div className="-mx-4 px-4 py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-default-500 text-sm">Status:</span>
                <Chip variant="flat" color={getStatusColor(rfqStatus)} size="sm">
                  {getStatusText(rfqStatus)}
                </Chip>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${COLORS.text.tertiary}`}>Currency:</span>
                <span className="text-sm">{quotationData.currency}</span>
              </div>
              {quotationData.validUntil && (
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${COLORS.text.tertiary}`}>Valid Until:</span>
                    <span className="text-sm">{formatDate(quotationData.validUntil)}</span>
                  </div>
              )}
            </div>
          </div>

          {/* 价格摘要区块 */}
          <div className="-mx-4 px-4 py-4">
            <h3 className="font-semibold text-base mb-3">{t("priceSummary")}</h3>
            <div className="bg-default-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className={COLORS.text.tertiary}>{t("subtotal")}:</span>
                <span
                    className="text-sm">{fenToYuan(quotationData.items.reduce((sum, item) => sum + item.totalPrice, 0))}</span>
              </div>
              <div className="border-t border-default-200 my-1"/>
              <div className="flex justify-between font-bold">
                <span>{t("total")}:</span>
                <span>{fenToYuan(quotationData.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* 付款条款区块（移动端） */}
          {(quotationData.productionRatio !== undefined || quotationData.preDelvRatio !== undefined || quotationData.postDelvRatio !== undefined) && (
              <div className="-mx-4 px-4 py-4">
                <h3 className="font-semibold text-base mb-3">{t("paymentTerms")}</h3>
                <div className="bg-default-50 rounded-lg p-3 space-y-2">
                  {quotationData.productionRatio !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${COLORS.text.tertiary}`}>{t("productionPayment")}:</span>
                        <span className="text-sm font-bold text-primary">{quotationData.productionRatio}%</span>
                      </div>
                  )}
                  {quotationData.preDelvRatio !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${COLORS.text.tertiary}`}>{t("preDeliveryPayment")}:</span>
                        <span className="text-sm font-bold text-primary">{quotationData.preDelvRatio}%</span>
                      </div>
                  )}
                  {quotationData.postDelvRatio !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${COLORS.text.tertiary}`}>{t("postDeliveryPayment")}:</span>
                        <span className="text-sm font-bold text-primary">{quotationData.postDelvRatio}%</span>
                      </div>
                  )}
                </div>
              </div>
          )}

          {/* 商品列表区块 */}
          <div className="-mx-4 px-4 py-4">
            <h3 className={`font-bold text-base ${COLORS.text.primary} mb-3`}>{t("items")}</h3>
            <div className="space-y-3">
              {quotationData.items.map((item, index) => (
                  <div key={index} className={index > 0 ? "pt-3 border-t border-default-100" : ""}>
                    <User
                        avatarProps={{src: item.picUrl, size: "md", radius: "md"}}
                        name={<span
                            className={`text-sm font-bold ${COLORS.text.primary} line-clamp-1`}>{item.spuName}</span>}
                        description={
                          <div className="space-y-0.5">
                            <p className={`text-tiny ${COLORS.text.tertiary}`}>
                              {item.skuName}
                            </p>
                            {item.supplierName && (
                                <p className={`text-tiny ${COLORS.text.tertiary}`}>
                                  {t("supplier")}: {item.supplierName}
                                </p>
                            )}
                            <p className={`text-tiny ${COLORS.text.primary} font-medium`}>
                              {t("quantity")}: {item.count} × {fenToYuan(item.unitPrice)} = {fenToYuan(item.totalPrice)}
                            </p>
                          </div>
                        }
                    />
                  </div>
              ))}
            </div>
          </div>

          {/* 接受报价警告 */}
          {canAcceptReject(rfqStatus) && (
              <div className="-mx-4 px-4 py-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ {t("acceptWarning")}
                  </p>
                </div>
              </div>
          )}

          {/* 手机端底部操作按钮 */}
          {canAcceptReject(rfqStatus) && (
              <div className="-mx-4 px-4 py-4 flex gap-2">
                <Button
                    className="flex-1"
                    color="danger"
                    variant="flat"
                    isLoading={rejectMutation.isPending}
                    onPress={handleReject}
                >
                  {t("reject")}
                </Button>
                <Button
                    className="flex-1"
                    color="primary"
                    isLoading={acceptMutation.isPending}
                    onPress={handleAccept}
                >
                  {t("accept")}
                </Button>
              </div>
          )}
        </div>

        {/* 桌面端内容 */}
        <div className="hidden md:block space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardBody className="space-y-4">
                <h3 className="font-semibold text-lg">{t("basicInfo")}</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className={COLORS.text.tertiary}>{t("statusLabel")}:</span>
                    <Chip className="ml-2" size="sm" color={getStatusColor(rfqStatus)}>
                      {getStatusText(rfqStatus)}
                    </Chip>
                  </div>
                  <div>
                    <span className={COLORS.text.tertiary}>{t("currency")}:</span>
                    <span className="ml-2">{quotationData.currency}</span>
                  </div>
                  {quotationData.incoterms && (
                      <div>
                        <span className={COLORS.text.tertiary}>{t("incoterms")}:</span>
                        <span className="ml-2">{quotationData.incoterms}</span>
                      </div>
                  )}
                  {quotationData.deliveryPort && (
                      <div>
                        <span className={COLORS.text.tertiary}>{t("deliveryPort")}:</span>
                        <span className="ml-2">{quotationData.deliveryPort}</span>
                      </div>
                  )}
                  {quotationData.validUntil && (
                      <div>
                        <span className={COLORS.text.tertiary}>{t("validUntil")}:</span>
                        <span className="ml-2">{formatDate(quotationData.validUntil)}</span>
                      </div>
                  )}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-4">
                <h3 className="font-semibold text-lg">{t("priceSummary")}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={COLORS.text.tertiary}>{t("subtotal")}:</span>
                    <span>{fenToYuan(quotationData.items.reduce((sum, item) => sum + item.totalPrice, 0))}</span>
                  </div>
                  <Divider/>
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t("total")}:</span>
                    <span>{fenToYuan(quotationData.totalPrice)}</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 付款条款卡片 */}
            {(quotationData.productionRatio !== undefined || quotationData.preDelvRatio !== undefined || quotationData.postDelvRatio !== undefined) && (
                <Card className="md:col-span-2">
                  <CardBody className="space-y-4">
                    <h3 className="font-semibold text-lg">{t("paymentTerms")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {quotationData.productionRatio !== undefined && (
                          <div className="bg-default-50 rounded-lg p-3">
                            <p className={`text-sm ${COLORS.text.tertiary}`}>{t("productionPayment")}</p>
                            <p className="text-xl font-bold text-primary">{quotationData.productionRatio}%</p>
                          </div>
                      )}
                      {quotationData.preDelvRatio !== undefined && (
                          <div className="bg-default-50 rounded-lg p-3">
                            <p className={`text-sm ${COLORS.text.tertiary}`}>{t("preDeliveryPayment")}</p>
                            <p className="text-xl font-bold text-primary">{quotationData.preDelvRatio}%</p>
                          </div>
                      )}
                      {quotationData.postDelvRatio !== undefined && (
                          <div className="bg-default-50 rounded-lg p-3">
                            <p className={`text-sm ${COLORS.text.tertiary}`}>{t("postDeliveryPayment")}</p>
                            <p className="text-xl font-bold text-primary">{quotationData.postDelvRatio}%</p>
                          </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
            )}
          </div>

          {/* 商品列表 - 桌面端复用 User 组件 */}
          <Card>
            <CardBody className="space-y-4">
              <h3 className="font-semibold text-lg">{t("items")}</h3>
              <div className="space-y-4">
                {quotationData.items.map((item, index) => (
                    <div key={index}>
                      {index > 0 && <Divider className="my-4"/>}
                      <User
                          avatarProps={{src: item.picUrl, size: "lg", radius: "md"}}
                          name={<span className={`font-bold ${COLORS.text.primary}`}>{item.spuName}</span>}
                          description={
                            <div className="space-y-1">
                              <p className={`text-sm ${COLORS.text.tertiary}`}>{item.skuName}</p>
                              {item.supplierName && (
                                  <p className={`text-sm ${COLORS.text.tertiary}`}>
                                    {t("supplier")}: {item.supplierName}
                                  </p>
                              )}
                              <p className={`text-sm ${COLORS.text.primary} font-medium`}>
                                {t("quantity")}: {item.count} × {fenToYuan(item.unitPrice)} = {fenToYuan(item.totalPrice)}
                              </p>
                            </div>
                          }
                      />
                    </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* 接受报价警告 */}
          {canAcceptReject(rfqStatus) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ {t("acceptWarning")}
                </p>
              </div>
          )}
        </div>
      </div>
  );
};
