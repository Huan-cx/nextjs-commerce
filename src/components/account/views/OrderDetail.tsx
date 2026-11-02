"use client";

import {Button, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, User} from "@heroui/react";
import {ChevronLeftIcon, CreditCardIcon, MapPinIcon, TruckIcon} from "@heroicons/react/24/outline";
import {OrderAddress, OrderDetail} from "@utils/api/trade";
import {fenToYuan} from "@utils/formatNumber";
import {useTranslations} from "next-intl";
import Image from "next/image";

interface OrderDetailProps {
  data: OrderDetail;
  onBack?: () => void;
}

// ========== 颜色和样式常量 ==========
const COLORS = {
  // 状态颜色映射
  getStatusColor: (status: number) => {
    if (status === 0 || status === 10) return "warning"; // 待处理/待付款
    if (status === 20) return "primary"; // 已发货
    if (status === 30) return "success"; // 已完成
    if (status === 40) return "danger"; // 已取消
    return "default";
  },
  // 背景色类名
  background: {
    card: "bg-white",
    muted: "bg-default-50",
    accent: "bg-blue-50",
  },
  // 文字颜色类名
  text: {
    primary: "text-default-900",
    secondary: "text-default-600",
    tertiary: "text-default-400",
  },
  // 边框类名
  border: {
    light: "border-default-100",
    medium: "border-default-200",
  },
} as const;

// ========== 子组件：地址卡片 ==========
const AddressCard = ({
                       title,
                       icon: Icon,
                       address,
                       colorClass = "text-primary",
                       bgClass = "bg-primary/10",
                       t,
                       isMobile = false,
                     }: {
  title: string;
  icon: any;
  address?: OrderAddress;
  colorClass?: string;
  bgClass?: string;
  t: any;
  isMobile?: boolean;
}) => {
  if (!address) return null;

  // 手机端简洁设计
  if (isMobile) {
    return (
        <div className="-mx-4 px-4 py-4 border-b border-default-100 last:border-b-0">
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-lg ${bgClass}`}>
              <Icon className={`w-4 h-4 ${colorClass}`}/>
            </div>
            <h4 className="font-semibold text-default-900">{title}</h4>
          </div>
          {address.companyName && (
              <p className="font-medium text-default-800 mb-1">{address.companyName}</p>
          )}
          <p className={`text-sm ${COLORS.text.secondary} mb-1`}>
            {address.firstName} {address.lastName}
          </p>
          <p className="text-sm text-default-500">
            {address.address}
            {address.street && `, ${address.street}`}
          </p>
          <p className="text-sm text-default-500">
            {address.city}, {address.state} {address.postcode}, {address.country}
          </p>
          <p className="text-sm text-default-500 mt-1">{t("contact")}: {address.phone}</p>
          {address.email && <p className="text-sm text-default-500">{address.email}</p>}
          {address.vat && <p className="text-sm text-default-500">VAT: {address.vat}</p>}
          {address.eori && <p className="text-sm text-default-500">EORI: {address.eori}</p>}
        </div>
    );
  }

  // 桌面端卡片设计
  return (
      <div className={`p-4 rounded-xl border ${COLORS.border.medium} hover:shadow-sm transition-shadow`}>
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-2 rounded-lg ${bgClass}`}>
            <Icon className={`w-4 h-4 ${colorClass}`}/>
          </div>
          <h4 className="font-semibold text-default-900">{title}</h4>
        </div>
        {address.companyName && (
            <p className="font-medium text-default-800 mb-1">{address.companyName}</p>
        )}
        <p className={`text-sm ${COLORS.text.secondary} mb-1`}>
          {address.firstName} {address.lastName}
        </p>
        <p className="text-sm text-default-500">
          {address.address}
          {address.street && `, ${address.street}`}
        </p>
        <p className="text-sm text-default-500">
          {address.city}, {address.state} {address.postcode}, {address.country}
        </p>
        <p className="text-sm text-default-500 mt-1">{t("contact")}: {address.phone}</p>
        {address.email && <p className="text-sm text-default-500">{address.email}</p>}
        {address.vat && <p className="text-sm text-default-500">VAT: {address.vat}</p>}
        {address.eori && <p className="text-sm text-default-500">EORI: {address.eori}</p>}
      </div>
  );
};

// ========== 子组件：费用明细行 ==========
const FeeRow = ({label, value, isBold = false, isMuted = false}: {
  label: string;
  value: string;
  isBold?: boolean;
  isMuted?: boolean;
}) => (
    <div
        className={`flex justify-between items-center py-1.5 ${isBold ? 'font-bold' : 'font-medium'} ${isMuted ? 'text-default-400' : 'text-default-700'}`}>
      <span className="text-sm">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
);

// ========== 子组件：订单时间线 ==========
const OrderTimeline = ({data, isMobile = false}: { data: OrderDetail; isMobile?: boolean }) => {
  const t = useTranslations("orderDetail");
  const timelineItems = [
    {
      key: 'created',
      label: t("timeline.created"),
      time: data.createTime,
      color: 'bg-primary',
      ringColor: 'ring-primary/20',
    },
    {
      key: 'paid',
      label: t("timeline.paid"),
      time: data.payTime,
      color: 'bg-primary',
      ringColor: 'ring-primary/20',
    },
    {
      key: 'shipped',
      label: t("timeline.shipped"),
      time: data.deliveryTime,
      color: 'bg-primary',
      ringColor: 'ring-primary/20',
    },
    {
      key: 'completed',
      label: t("timeline.completed"),
      time: data.finishTime,
      color: 'bg-success',
      ringColor: 'ring-success/20',
      condition: data.status === 30,
    },
    {
      key: 'cancelled',
      label: t("timeline.cancelled"),
      time: data.cancelTime,
      color: 'bg-danger',
      ringColor: 'ring-danger/20',
      condition: data.status === 40,
    },
  ].filter(item => item.time && (item.condition === undefined || item.condition));

  // 手机端简洁设计
  if (isMobile) {
    return (
        <div className="-mx-4 px-4 py-4">
          <h3 className={`font-bold text-lg ${COLORS.text.primary} mb-4`}>
            {t("orderTimeline")}
          </h3>
          <div className="space-y-3">
            {timelineItems.map((item, index) => (
                <div key={item.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                        className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm ring-2 ${item.ringColor}`}
                    />
                    {index < timelineItems.length - 1 && (
                        <div className="w-0.5 h-8 bg-default-200 mt-0.5"/>
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className={`font-semibold ${COLORS.text.primary} text-sm`}>{item.label}</p>
                    <p className={`text-xs ${COLORS.text.tertiary} mt-0.5`}>
                      {new Date(item.time).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
            ))}
          </div>
        </div>
    );
  }

  // 桌面端设计
  return (
      <div className="p-5 rounded-xl border border-default-200 bg-white">
        <h3 className={`font-bold text-lg ${COLORS.text.primary} mb-5`}>
          {t("orderTimeline")}
        </h3>
        <div className="space-y-4">
          {timelineItems.map((item, index) => (
              <div key={item.key} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div
                      className={`w-3 h-3 rounded-full ${item.color} shadow-sm ring-2 ${item.ringColor} group-hover:scale-110 transition-transform duration-200`}
                  />
                  {index < timelineItems.length - 1 && (
                      <div className="w-0.5 h-10 bg-default-200 mt-1"/>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className={`font-semibold ${COLORS.text.primary}`}>{item.label}</p>
                  <p className={`text-sm ${COLORS.text.tertiary} mt-0.5`}>
                    {new Date(item.time).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

// ========== 主组件 ==========
export const OrderDetailView = ({data, onBack}: OrderDetailProps) => {
  const t = useTranslations("orderDetail");
  const items = data.items || [];
  const feeItems = data.feeItems || [];

  // 获取状态文本
  const getStatusText = (status: number) => {
    if (data.statusName) return data.statusName;
    if (status === 0) return t("status.pending");
    if (status === 10) return t("status.unpaid");
    if (status === 20) return t("status.shipped");
    if (status === 30) return t("status.completed");
    if (status === 40) return t("status.cancelled");
    return t("status.unknown");
  };

  // 判断是否为 B2B 订单（有报价单ID或询价单ID）
  const isB2BOrder = data.quotationId || data.rfqId;

  // 计算总金额（包含增值费用）
  if (!data.id) {
    return (
        <div className="max-w-6xl mx-auto p-6">
          <p className={COLORS.text.secondary}>{t("notFound")}</p>
        </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto w-full">
        {/* ========== 顶部标题栏 ========== */}
        <div className="hidden md:flex items-center gap-4 mb-6">
          {onBack && (
              <Button
                  variant="light"
                  radius="lg"
                  className="font-semibold px-4"
                  onPress={onBack}
                  startContent={<ChevronLeftIcon className="w-5 h-5"/>}
              >
                {t("back")}
              </Button>
          )}
          <div>
            <h1 className={`text-2xl font-bold ${COLORS.text.primary}`}>
              {t("orderNo")} #{data.no || data.id}
            </h1>
        </div>
          <Chip
              variant="flat"
              color={COLORS.getStatusColor(data.status) as any}
              size="lg"
              classNames={{
                base: "ml-4",
                content: "font-semibold",
              }}
          >
            {getStatusText(data.status)}
          </Chip>
        </div>

        {/* ========== 移动端标题栏 ========== */}
        <div className="md:hidden -mx-4 px-4 py-3 border-b border-default-100 mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
                <Button isIconOnly size="sm" variant="light" radius="full" onPress={onBack}>
                  <ChevronLeftIcon className="w-5 h-5"/>
                </Button>
            )}
            <div className="flex-1">
              <h1 className="text-lg font-bold text-default-900">{t("orderNo")} #{data.no || data.id}</h1>
            </div>
            <Chip
                variant="flat"
                color={COLORS.getStatusColor(data.status) as any}
                size="sm"
            >
              {getStatusText(data.status)}
            </Chip>
          </div>
        </div>

        {/* ========== 主体内容区 - 桌面端 ========== */}
        <div className="hidden md:block space-y-6">
          {/* ========== 1. 订单基本信息卡片 ========== */}
          <div className="p-5 rounded-xl border border-default-200 bg-white">
            <h3 className={`font-bold text-lg ${COLORS.text.primary} mb-4`}>
              {t("orderInfo")}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className={`text-sm ${COLORS.text.tertiary} mb-1`}>{t("orderDate")}</p>
                <p className={`font-medium ${COLORS.text.secondary}`}>
                  {new Date(data.createTime).toLocaleDateString('zh-CN')}
                </p>
              </div>
              <div>
                <p className={`text-sm ${COLORS.text.tertiary} mb-1`}>{t("paymentMethod")}</p>
                <p className={`font-medium ${COLORS.text.secondary}`}>
                  {data.paymentMethodName || data.payChannelName || "-"}
                </p>
              </div>
              <div>
                <p className={`text-sm ${COLORS.text.tertiary} mb-1`}>{t("paymentStatus")}</p>
                <Chip
                    variant="flat"
                    color={data.payStatus ? "success" : "warning"}
                    size="sm"
                    className="mt-0.5"
                >
                  {data.payStatus ? t("paid") : t("unpaid")}
                </Chip>
              </div>
              {data.logisticsNo && (
                  <div>
                    <p className={`text-sm ${COLORS.text.tertiary} mb-1`}>{t("trackingNo")}</p>
                    <p className={`font-medium ${COLORS.text.secondary}`}>{data.logisticsNo}</p>
                  </div>
              )}
              {isB2BOrder && data.currency && (
                  <div>
                    <p className={`text-sm ${COLORS.text.tertiary} mb-1`}>{t("currency")}</p>
                    <p className={`font-medium ${COLORS.text.secondary}`}>{data.currency}</p>
                  </div>
              )}
              {isB2BOrder && data.incoterms && (
                  <div>
                    <p className={`text-sm ${COLORS.text.tertiary} mb-1`}>{t("incoterms")}</p>
                    <p className={`font-medium ${COLORS.text.secondary}`}>{data.incoterms}</p>
                  </div>
              )}
              {isB2BOrder && data.contractNo && (
                  <div>
                    <p className={`text-sm ${COLORS.text.tertiary} mb-1`}>{t("contractNo")}</p>
                    <p className={`font-medium ${COLORS.text.secondary}`}>{data.contractNo}</p>
                  </div>
              )}
            </div>
          </div>

          {/* ========== 2. 商品明细表格 ========== */}
          <div className="p-5 rounded-xl border border-default-200 bg-white overflow-hidden">
            <h3 className={`font-bold text-lg ${COLORS.text.primary} mb-4`}>
              {t("productList")}
            </h3>
            <Table
                removeWrapper
                aria-label="Order Items"
            >
              <TableHeader className="bg-default-50">
                <TableColumn
                    className="text-default-500 font-bold h-12 text-xs uppercase tracking-wider">{t("product")}</TableColumn>
                <TableColumn
                    className="text-right text-default-500 font-bold h-12 text-xs uppercase tracking-wider">{t("unitPrice")}</TableColumn>
                <TableColumn
                    className="text-center text-default-500 font-bold h-12 text-xs uppercase tracking-wider">{t("quantity")}</TableColumn>
                <TableColumn
                    className="text-right text-default-500 font-bold h-12 text-xs uppercase tracking-wider">{t("subtotal")}</TableColumn>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-default-50/50">
                      <TableCell className="py-4 border-b border-default-100">
                        <div className="flex items-center gap-3">
                          <div
                              className="relative h-14 w-14 rounded-lg overflow-hidden border border-default-200 bg-white">
                            <Image
                                src={item.picUrl || "/placeholder.png"}
                                alt={item.spuName}
                                className="h-full w-full object-cover"
                                width={56}
                                height={56}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${COLORS.text.primary} truncate`}>
                              {item.spuName}
                            </p>
                            {item.skuName && (
                                <p className={`text-sm ${COLORS.text.tertiary} truncate mt-0.5`}>
                                  {item.skuName}
                                </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                          className={`py-4 border-b border-default-100 text-right font-medium ${COLORS.text.secondary}`}>
                        {fenToYuan(item.price)}
                      </TableCell>
                      <TableCell className="py-4 border-b border-default-100 text-center">
                        <span
                            className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-default-100 text-sm font-medium">
                          {item.count}
                        </span>
                      </TableCell>
                      <TableCell
                          className={`py-4 border-b border-default-100 text-right font-bold ${COLORS.text.primary}`}>
                        {fenToYuan(item.payPrice)}
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ========== 3. 费用明细卡片 ========== */}
          <div className="p-5 rounded-xl border border-default-200 bg-white">
            <h3 className={`font-bold text-lg ${COLORS.text.primary} mb-4`}>
              {t("priceSummary")}
            </h3>
            <div className="bg-default-50 rounded-lg p-4 space-y-1">
              <FeeRow label={t("subtotal")} value={fenToYuan(data.totalPrice)}/>
              {data.discountPrice > 0 && (
                  <FeeRow label={t("discount")} value={`- ${fenToYuan(data.discountPrice)}`}/>
              )}
              {data.couponPrice > 0 && (
                  <FeeRow label={t("couponDiscount")} value={`- ${fenToYuan(data.couponPrice)}`}/>
              )}
              {data.deliveryPrice > 0 && (
                  <FeeRow label={t("deliveryFee")} value={fenToYuan(data.deliveryPrice)}/>
              )}
              {feeItems.map((fee, index) => (
                  <FeeRow key={index} label={fee.feeTypeName || fee.feeName} value={fenToYuan(fee.amount)}/>
              ))}
              {data.adjustPrice !== 0 && (
                  <FeeRow
                      label={data.adjustPrice > 0 ? t("surcharge") : t("adjustDiscount")}
                      value={`${data.adjustPrice > 0 ? '+' : ''}${fenToYuan(data.adjustPrice)}`}
                  />
              )}
              <div className="border-t border-default-200 my-2"/>
              <FeeRow label={t("grandTotal")} value={fenToYuan(data.payPrice)} isBold={true}/>
              {isB2BOrder && data.paidPrice !== undefined && data.paidPrice > 0 && (
                  <FeeRow label={t("amountPaid")} value={fenToYuan(data.paidPrice)}/>
              )}
              {data.refundPrice > 0 && (
                  <FeeRow label={t("refundAmount")} value={`- ${fenToYuan(data.refundPrice)}`}/>
              )}
            </div>
          </div>

          {/* ========== 4. 地址信息卡片网格 ========== */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <AddressCard
                title={t("billingAddress")}
                icon={CreditCardIcon}
                address={data.billingAddress}
                colorClass="text-primary"
                bgClass="bg-primary/10"
                t={t}
            />
            <AddressCard
                title={t("shippingAddress")}
                icon={MapPinIcon}
                address={data.receiverAddress}
                colorClass="text-success"
                bgClass="bg-success/10"
                t={t}
            />
            {data.importerAddress && (
                <AddressCard
                    title={t("importerAddress")}
                    icon={TruckIcon}
                    address={data.importerAddress}
                    colorClass="text-warning"
                    bgClass="bg-warning/10"
                    t={t}
                />
            )}
          </div>

          {/* ========== 5. 订单时间线 ========== */}
          <OrderTimeline data={data}/>
        </div>

        {/* ========== 主体内容区 - 手机端（简洁设计，无外框） ========== */}
        <div className="md:hidden space-y-0 divide-y divide-default-100">
          {/* ========== 1. 订单基本信息 ========== */}
          <div className="-mx-4 px-4 py-4">
            <h3 className={`font-bold text-base ${COLORS.text.primary} mb-3`}>
              {t("orderInfo")}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className={`text-sm ${COLORS.text.tertiary}`}>{t("orderDate")}</p>
                <p className={`text-sm font-medium ${COLORS.text.secondary}`}>
                  {new Date(data.createTime).toLocaleDateString('zh-CN')}
                </p>
              </div>
              <div className="flex justify-between">
                <p className={`text-sm ${COLORS.text.tertiary}`}>{t("paymentMethod")}</p>
                <p className={`text-sm font-medium ${COLORS.text.secondary}`}>
                  {data.paymentMethodName || data.payChannelName || "-"}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-sm ${COLORS.text.tertiary}`}>{t("paymentStatus")}</p>
                <Chip
                    variant="flat"
                    color={data.payStatus ? "success" : "warning"}
                    size="sm"
                >
                  {data.payStatus ? t("paid") : t("unpaid")}
                </Chip>
              </div>
              {data.logisticsNo && (
                  <div className="flex justify-between">
                    <p className={`text-sm ${COLORS.text.tertiary}`}>{t("trackingNo")}</p>
                    <p className={`text-sm font-medium ${COLORS.text.secondary}`}>{data.logisticsNo}</p>
                  </div>
              )}
              {isB2BOrder && data.currency && (
                  <div className="flex justify-between">
                    <p className={`text-sm ${COLORS.text.tertiary}`}>{t("currency")}</p>
                    <p className={`text-sm font-medium ${COLORS.text.secondary}`}>{data.currency}</p>
                  </div>
              )}
              {isB2BOrder && data.incoterms && (
                  <div className="flex justify-between">
                    <p className={`text-sm ${COLORS.text.tertiary}`}>{t("incoterms")}</p>
                    <p className={`text-sm font-medium ${COLORS.text.secondary}`}>{data.incoterms}</p>
                  </div>
              )}
            </div>
          </div>

          {/* ========== 2. 商品明细 ========== */}
          <div className="-mx-4 px-4 py-4">
            <h3 className={`font-bold text-base ${COLORS.text.primary} mb-3`}>
              {t("productList")}
            </h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                  <div key={item.id} className={index > 0 ? "pt-3 border-t border-default-100" : ""}>
                    <User
                        avatarProps={{src: item.picUrl, size: "md", radius: "md"}}
                        name={<span
                            className={`text-sm font-bold ${COLORS.text.primary} line-clamp-1`}>{item.spuName}</span>}
                        description={
                          <div className="space-y-0.5">
                            {item.skuName && (
                                <p className={`text-tiny ${COLORS.text.tertiary}`}>{item.skuName}</p>
                            )}
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-tiny text-default-500">
                                {t("unitPrice")}: <span
                                  className="font-medium text-default-700">{fenToYuan(item.price)}</span>
                              </span>
                              <span className="text-tiny text-default-500">
                                {t("quantity")}: <span className="font-medium text-default-700">{item.count}</span>
                              </span>
                            </div>
                            <div className="text-right mt-1">
                              <span className="text-sm font-bold text-default-900">
                                {t("subtotal")}: {fenToYuan(item.payPrice)}
                              </span>
                            </div>
                          </div>
                        }
                    />
                  </div>
              ))}
            </div>
          </div>

          {/* ========== 3. 费用明细 ========== */}
          <div className="-mx-4 px-4 py-4">
            <h3 className={`font-bold text-base ${COLORS.text.primary} mb-3`}>
              {t("priceSummary")}
            </h3>
            <div className="bg-default-50 rounded-lg p-3 space-y-1">
              <FeeRow label={t("subtotal")} value={fenToYuan(data.totalPrice)}/>
              {data.discountPrice > 0 && (
                  <FeeRow label={t("discount")} value={`- ${fenToYuan(data.discountPrice)}`}/>
              )}
              {data.couponPrice > 0 && (
                  <FeeRow label={t("couponDiscount")} value={`- ${fenToYuan(data.couponPrice)}`}/>
              )}
              {data.deliveryPrice > 0 && (
                  <FeeRow label={t("deliveryFee")} value={fenToYuan(data.deliveryPrice)}/>
              )}
              {feeItems.map((fee, index) => (
                  <FeeRow key={index} label={fee.feeTypeName || fee.feeName} value={fenToYuan(fee.amount)}/>
              ))}
              {data.adjustPrice !== 0 && (
                  <FeeRow
                      label={data.adjustPrice > 0 ? t("surcharge") : t("adjustDiscount")}
                      value={`${data.adjustPrice > 0 ? '+' : ''}${fenToYuan(data.adjustPrice)}`}
                  />
              )}
              <div className="border-t border-default-200 my-1"/>
              <FeeRow label={t("grandTotal")} value={fenToYuan(data.payPrice)} isBold={true}/>
              {isB2BOrder && data.paidPrice !== undefined && data.paidPrice > 0 && (
                  <FeeRow label={t("amountPaid")} value={fenToYuan(data.paidPrice)}/>
              )}
              {data.refundPrice > 0 && (
                  <FeeRow label={t("refundAmount")} value={`- ${fenToYuan(data.refundPrice)}`}/>
              )}
            </div>
          </div>

          {/* ========== 4. 地址信息 ========== */}
          <div>
            <AddressCard
                title={t("billingAddress")}
                icon={CreditCardIcon}
                address={data.billingAddress}
                colorClass="text-primary"
                bgClass="bg-primary/10"
                t={t}
                isMobile={true}
            />
            <AddressCard
                title={t("shippingAddress")}
                icon={MapPinIcon}
                address={data.receiverAddress}
                colorClass="text-success"
                bgClass="bg-success/10"
                t={t}
                isMobile={true}
            />
            {data.importerAddress && (
                <AddressCard
                    title={t("importerAddress")}
                    icon={TruckIcon}
                    address={data.importerAddress}
                    colorClass="text-warning"
                    bgClass="bg-warning/10"
                    t={t}
                    isMobile={true}
                />
            )}
          </div>

          {/* ========== 5. 订单时间线 ========== */}
          <OrderTimeline data={data} isMobile={true}/>
        </div>
      </div>
  );
};