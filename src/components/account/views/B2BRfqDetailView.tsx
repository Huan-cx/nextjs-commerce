"use client";

import {Button, Card, CardBody, Chip, Divider, Spinner, User} from "@heroui/react";
import {ChevronLeftIcon} from "@heroicons/react/24/outline";
import {B2BRfqDetail, cancelRfq, getRfqDetail} from "@utils/api/b2b";
import {RfqStatus} from "@/types/api/b2b";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useTranslations} from "next-intl";
import {fenToYuan} from "@utils/formatNumber";
import {useCustomToast} from "@utils/hooks/useToast";
import {PriceWrapper} from '@/components/theme/ui/Price';

// 统一色彩系统 - 与 OrderDetailView 保持一致
const COLORS = {
  status: {
    pending: 'warning',
    quoted: 'success',
    ordered: 'primary',
    completed: 'danger',
    canceled: 'danger',
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

interface B2BRfqDetailViewProps {
  rfqId: number;
  onBack: () => void;
  onViewQuotation: () => void;
}

export const B2BRfqDetailView = ({rfqId, onBack, onViewQuotation}: B2BRfqDetailViewProps) => {
  const t = useTranslations("b2b.rfqDetail");
  const {showToast} = useCustomToast();
  const queryClient = useQueryClient();

  const {data: rfqData, isLoading} = useQuery<B2BRfqDetail>({
    queryKey: ["b2bRfqDetail", rfqId],
    queryFn: () => getRfqDetail(rfqId),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelRfq,
    onSuccess: () => {
      showToast(t("cancelSuccess"), "success");
      queryClient.invalidateQueries({queryKey: ["b2bRfqDetail", rfqId]});
      queryClient.invalidateQueries({queryKey: ["b2bRfqs"]});
    },
    onError: (error: Error) => {
      showToast(error.message || t("cancelFailed"), "danger");
    },
  });

  const handleCancel = () => {
    if (rfqData) {
      cancelMutation.mutate(rfqData.id);
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: number) => {
    if (status === RfqStatus.ORDERED) return COLORS.status.ordered;     // 已下单 - 蓝色
    if (status === RfqStatus.QUOTED) return COLORS.status.quoted;       // 已报价 - 绿色
    if (status === RfqStatus.INQUIRING) return COLORS.status.pending;   // 询价中 - 橙色
    if (status === RfqStatus.COMPLETED || status === RfqStatus.CANCELED) return COLORS.status.completed; // 已完成/已取消 - 红色
    return 'default';
  };

  // 获取状态国际化键名
  const getStatusKey = (status: number) => {
    switch (status) {
      case RfqStatus.INQUIRING:
        return "inquiring";
      case RfqStatus.QUOTED:
        return "quoted";
      case RfqStatus.COMPLETED:
        return "completed";
      case RfqStatus.CANCELED:
        return "canceled";
      case RfqStatus.ORDERED:
        return "ordered";
      default:
        return "unknown";
    }
  };

  // 判断是否可以取消：只有询价中状态可以取消
  const canCancel = (status: number) => {
    return status === RfqStatus.INQUIRING;
  };

  // 判断是否可以查看报价：已报价和已下单状态都可以查看
  const canViewQuotation = (status: number) => {
    return status === RfqStatus.QUOTED || status === RfqStatus.ORDERED;
  };

  const getDeliveryTypeText = (type: string | undefined) => {
    if (!type) return undefined;

    const backendToFrontendMap: Record<string, string> = {
      "ASAP": "ASAP",
      "30DAYS": "WITHIN_30_DAYS",
      "60DAYS": "WITHIN_60_DAYS",
      "DATE": "CUSTOM_DATE",
    };

    const frontendType = backendToFrontendMap[type] || type;
    return t(`expectedDeliveryTypeOptions.${frontendType}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading || !rfqData) {
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
          <h1 className="text-lg font-bold">{t("title")} #{rfqData.no}</h1>
        </div>

        {/* 桌面端：顶部标题栏 */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button size="sm" variant="light" onPress={onBack}>
              <ChevronLeftIcon className="w-4 h-4 mr-1"/>
              {t("back")}
            </Button>
            <h2 className="text-2xl font-bold">{t("title")} #{rfqData.no}</h2>
          </div>
          <div className="flex gap-2">
            {canCancel(rfqData.status) && (
                <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    isLoading={cancelMutation.isPending}
                    onPress={handleCancel}
                >
                  {t("cancel")}
                </Button>
            )}
            {canViewQuotation(rfqData.status) && (
                <Button size="sm" color="primary" onPress={onViewQuotation}>
                  {t("viewQuotation")}
                </Button>
            )}
          </div>
        </div>

        {/* 手机端内容容器 - 简洁设计，无外框 */}
        <div className="md:hidden pb-8 space-y-0 divide-y divide-default-100">
          {/* Information区块 */}
          <div className="-mx-4 px-4 py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${COLORS.text.tertiary}`}>RFQ No:</span>
                <span className={`font-bold ${COLORS.text.primary}`}>#{rfqData.no}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-default-500 text-sm">Status:</span>
                <Chip variant="flat" color={getStatusColor(rfqData.status)} size="sm">
                  {t(`status.${getStatusKey(rfqData.status)}`)}
                </Chip>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${COLORS.text.tertiary}`}>Created:</span>
                <span className={`text-sm font-medium ${COLORS.text.secondary}`}>{formatDate(rfqData.createTime)}</span>
              </div>
              {rfqData.submittedAt && (
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${COLORS.text.tertiary}`}>Submitted:</span>
                    <span className="text-sm">{formatDate(rfqData.submittedAt)}</span>
                  </div>
              )}
              {rfqData.validUntil && (
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${COLORS.text.tertiary}`}>{t("validUntil")}:</span>
                    <span className="text-sm">{formatDate(rfqData.validUntil)}</span>
                  </div>
              )}
              {rfqData.supplierName && (
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${COLORS.text.tertiary}`}>Supplier:</span>
                    <span className="text-sm">{rfqData.supplierName}</span>
                  </div>
              )}
            </div>
          </div>

          {/* Contact Info区块 */}
          <div className="-mx-4 px-4 py-4">
            <h3 className="font-semibold text-base mb-3">{t("contactInfo")}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-sm ${COLORS.text.tertiary}`}>{t("contactName")}:</span>
                <span className="text-sm">{rfqData.contactName}</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${COLORS.text.tertiary}`}>{t("email")}:</span>
                <span className="text-sm">{rfqData.email}</span>
              </div>
              {rfqData.country && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${COLORS.text.tertiary}`}>{t("country")}:</span>
                    <span className="text-sm">{rfqData.country}</span>
                  </div>
              )}
              {rfqData.city && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${COLORS.text.tertiary}`}>{t("city")}:</span>
                    <span className="text-sm">{rfqData.city}</span>
                  </div>
              )}
              {rfqData.postalCode && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${COLORS.text.tertiary}`}>{t("postalCode")}:</span>
                    <span className="text-sm">{rfqData.postalCode}</span>
                  </div>
              )}
            </div>
          </div>

          {/* Delivery Info区块 */}
          {(rfqData.incoterms || rfqData.deliveryPort || rfqData.expectedDeliveryType || rfqData.expectedDeliveryDate) && (
              <div className="-mx-4 px-4 py-4">
                <h3 className="font-semibold text-base mb-3">{t("deliveryInfo")}</h3>
                <div className="space-y-2">
                  {rfqData.incoterms && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${COLORS.text.tertiary}`}>{t("incoterms")}:</span>
                        <span className="text-sm font-medium">{rfqData.incoterms}</span>
                      </div>
                  )}
                  {rfqData.deliveryPort && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${COLORS.text.tertiary}`}>{t("deliveryPort")}:</span>
                        <span className="text-sm">{rfqData.deliveryPort}</span>
                      </div>
                  )}
                  {rfqData.expectedDeliveryType && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${COLORS.text.tertiary}`}>{t("expectedDeliveryType")}:</span>
                        <span className="text-sm">{getDeliveryTypeText(rfqData.expectedDeliveryType)}</span>
                      </div>
                  )}
                  {rfqData.expectedDeliveryType === "DATE" && rfqData.expectedDeliveryDate && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${COLORS.text.tertiary}`}>{t("expectedDeliveryDate")}:</span>
                        <span className="text-sm">{formatDate(rfqData.expectedDeliveryDate)}</span>
                      </div>
                  )}
                </div>
              </div>
          )}

          <PriceWrapper>
          {(rfqData.targetCurrency || rfqData.targetPrice || rfqData.targetPriceUnit) && (
              <div className="-mx-4 px-4 py-4">
                <h3 className="font-semibold text-base mb-3">{t("priceInfo")}</h3>
                <div className="space-y-2">
                  {rfqData.targetCurrency && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${COLORS.text.tertiary}`}>{t("targetCurrency")}:</span>
                        <span className="text-sm font-medium">{rfqData.targetCurrency}</span>
                      </div>
                  )}
                  {rfqData.targetPrice && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${COLORS.text.tertiary}`}>{t("targetPrice")}:</span>
                        <span className="text-sm font-medium text-primary">{fenToYuan(rfqData.targetPrice)}</span>
                      </div>
                  )}
                  {rfqData.targetPriceUnit && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${COLORS.text.tertiary}`}>Unit:</span>
                        <span className="text-sm">{rfqData.targetPriceUnit}</span>
                      </div>
                  )}
                </div>
              </div>
          )}
          </PriceWrapper>

          {/* Requirement区块 */}
          {rfqData.requirement && (
              <div className="-mx-4 px-4 py-4">
                <h3 className="font-semibold text-base mb-3">{t("requirement")}</h3>
                <p className="text-sm text-gray-600">{rfqData.requirement}</p>
              </div>
          )}

          {/* 商品列表 - 手机端 */}
          <div className="-mx-4 px-4 py-4">
            <h3 className={`font-bold text-base ${COLORS.text.primary} mb-3`}>{t("items")}</h3>
            <div className="space-y-3">
              {rfqData.items.map((item, index) => (
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
                            <p className={`text-tiny ${COLORS.text.primary} font-medium`}>
                              {t("quantity")}: {item.count}
                              <PriceWrapper>
                                {item.expectedPrice && (
                                    <span className="ml-4">{t("expectedPrice")}: {fenToYuan(item.expectedPrice)}</span>
                                )}
                              </PriceWrapper>
                            </p>
                          </div>
                        }
                    />
                  </div>
              ))}
            </div>
          </div>

          {/* 手机端底部操作按钮 */}
          <div className="-mx-4 px-4 py-4 flex gap-2">
            {canCancel(rfqData.status) && (
                <Button
                    className="flex-1"
                    color="danger"
                    variant="flat"
                    isLoading={cancelMutation.isPending}
                    onPress={handleCancel}
                >
                  {t("cancel")}
                </Button>
            )}
            {canViewQuotation(rfqData.status) && (
                <Button
                    className="flex-1"
                    color="primary"
                    onPress={onViewQuotation}
                >
                  {t("viewQuotation")}
                </Button>
            )}
          </div>
        </div>

        {/* 桌面端内容 */}
        <div className="hidden md:block space-y-6">
          {/* 基本信息卡片 */}
          <Card>
            <CardBody className="space-y-4">
              <h3 className="font-semibold text-lg">{t("basicInfo")}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={COLORS.text.tertiary}>{t("statusLabel")}:</span>
                  <Chip className="ml-2" size="sm" color={getStatusColor(rfqData.status)}>
                    {t(`status.${getStatusKey(rfqData.status)}`)}
                  </Chip>
                </div>
                <div>
                  <span className={COLORS.text.tertiary}>{t("createTime")}:</span>
                  <span className="ml-2">{formatDate(rfqData.createTime)}</span>
                </div>
                {rfqData.submittedAt && (
                    <div>
                      <span className={COLORS.text.tertiary}>{t("submitTime")}:</span>
                      <span className="ml-2">{formatDate(rfqData.submittedAt)}</span>
                    </div>
                )}
                {rfqData.validUntil && (
                    <div>
                      <span className={COLORS.text.tertiary}>{t("validUntil")}:</span>
                      <span className="ml-2">{formatDate(rfqData.validUntil)}</span>
                    </div>
                )}
                {rfqData.supplierName && (
                    <div>
                      <span className={COLORS.text.tertiary}>{t("supplier")}:</span>
                      <span className="ml-2">{rfqData.supplierName}</span>
                    </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* 联系信息卡片 */}
          <Card>
            <CardBody className="space-y-4">
              <h3 className="font-semibold text-lg">{t("contactInfo")}</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className={COLORS.text.tertiary}>{t("contactName")}:</span>
                  <span className="ml-2">{rfqData.contactName}</span>
                </div>
                <div>
                  <span className={COLORS.text.tertiary}>{t("email")}:</span>
                  <span className="ml-2">{rfqData.email}</span>
                </div>
                {rfqData.country && (
                    <div>
                      <span className={COLORS.text.tertiary}>{t("country")}:</span>
                      <span className="ml-2">{rfqData.country}</span>
                    </div>
                )}
                {rfqData.city && (
                    <div>
                      <span className={COLORS.text.tertiary}>{t("city")}:</span>
                      <span className="ml-2">{rfqData.city}</span>
                    </div>
                )}
                {rfqData.postalCode && (
                    <div>
                      <span className={COLORS.text.tertiary}>{t("postalCode")}:</span>
                      <span className="ml-2">{rfqData.postalCode}</span>
                    </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* 交货信息卡片 */}
          {(rfqData.incoterms || rfqData.deliveryPort || rfqData.expectedDeliveryType || rfqData.expectedDeliveryDate) && (
              <Card>
                <CardBody className="space-y-4">
                  <h3 className="font-semibold text-lg">{t("deliveryInfo")}</h3>
                  <div className="space-y-2 text-sm">
                    {rfqData.incoterms && (
                        <div>
                          <span className={COLORS.text.tertiary}>{t("incoterms")}:</span>
                          <span className="ml-2 font-medium">{rfqData.incoterms}</span>
                        </div>
                    )}
                    {rfqData.deliveryPort && (
                        <div>
                          <span className={COLORS.text.tertiary}>{t("deliveryPort")}:</span>
                          <span className="ml-2">{rfqData.deliveryPort}</span>
                        </div>
                    )}
                    {rfqData.expectedDeliveryType && (
                        <div>
                          <span className={COLORS.text.tertiary}>{t("expectedDeliveryType")}:</span>
                          <span className="ml-2">{getDeliveryTypeText(rfqData.expectedDeliveryType)}</span>
                        </div>
                    )}
                    {rfqData.expectedDeliveryType === "DATE" && rfqData.expectedDeliveryDate && (
                        <div>
                          <span className={COLORS.text.tertiary}>{t("expectedDeliveryDate")}:</span>
                          <span className="ml-2">{formatDate(rfqData.expectedDeliveryDate)}</span>
                        </div>
                    )}
                  </div>
                </CardBody>
              </Card>
          )}

          <PriceWrapper>
          {(rfqData.targetCurrency || rfqData.targetPrice || rfqData.targetPriceUnit) && (
              <Card>
                <CardBody className="space-y-4">
                  <h3 className="font-semibold text-lg">{t("priceInfo")}</h3>
                  <div className="space-y-2 text-sm">
                    {rfqData.targetCurrency && (
                        <div>
                          <span className={COLORS.text.tertiary}>{t("targetCurrency")}:</span>
                          <span className="ml-2 font-medium">{rfqData.targetCurrency}</span>
                        </div>
                    )}
                    {rfqData.targetPrice && (
                        <div>
                          <span className={COLORS.text.tertiary}>{t("targetPrice")}:</span>
                          <span className="ml-2 font-medium text-primary">{fenToYuan(rfqData.targetPrice)}</span>
                        </div>
                    )}
                    {rfqData.targetPriceUnit && (
                        <div>
                          <span className={COLORS.text.tertiary}>Unit:</span>
                          <span className="ml-2">{rfqData.targetPriceUnit}</span>
                        </div>
                    )}
                  </div>
                </CardBody>
              </Card>
          )}
          </PriceWrapper>

          {/* 需求描述卡片 */}
          {rfqData.requirement && (
              <Card>
                <CardBody>
                  <h3 className="font-semibold text-lg mb-2">{t("requirement")}</h3>
                  <p className="text-sm text-gray-600">{rfqData.requirement}</p>
                </CardBody>
              </Card>
          )}

          {/* 商品列表卡片 - 桌面端 */}
          <Card>
            <CardBody className="space-y-4">
              <h3 className="font-semibold text-lg">{t("items")}</h3>
              <div className="space-y-4">
                {rfqData.items.map((item, index) => (
                    <div key={index}>
                      {index > 0 && <Divider className="my-4"/>}
                      <User
                          avatarProps={{src: item.picUrl, size: "lg", radius: "md"}}
                          name={<span className={`font-bold ${COLORS.text.primary}`}>{item.spuName}</span>}
                          description={
                            <div className="space-y-1">
                              <p className={`text-sm ${COLORS.text.tertiary}`}>{item.skuName}</p>
                              <p className={`text-sm ${COLORS.text.primary} font-medium`}>
                                {t("quantity")}: {item.count}
                                <PriceWrapper>
                                  {item.expectedPrice && (
                                      <span
                                          className="ml-4">{t("expectedPrice")}: {fenToYuan(item.expectedPrice)}</span>
                                  )}
                                </PriceWrapper>
                              </p>
                            </div>
                          }
                      />
                    </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
  );
};
