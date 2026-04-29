"use client";

import {Button, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, User,} from "@heroui/react";
import {ChevronLeftIcon} from "@heroicons/react/24/outline";
import {OrderDetail} from "@utils/api/trade";
import {fenToYuan} from "@utils/formatNumber";

interface OrderDetailProps {
  data: OrderDetail;
  onBack?: () => void;
}

// 统一色彩系统
const COLORS = {
  // 状态颜色
  status: {
    pending: 'warning',
    unpaid: 'warning',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'danger',
  },
  // 背景颜色
  background: {
    primary: 'bg-default-50',
    secondary: 'bg-white',
    accent: 'bg-blue-50',
  },
  // 文字颜色
  text: {
    primary: 'text-default-800',
    secondary: 'text-default-600',
    tertiary: 'text-default-400',
    muted: 'text-default-300',
  },
  // 边框颜色
  border: {
    light: 'border-default-100',
    medium: 'border-default-200',
    dark: 'border-default-300',
  },
} as const;

export const OrderDetailView = ({data, onBack}: OrderDetailProps) => {
  const items = data.items || [];

  const getStatusText = (status: number) => {
    if (status === 0) return "Pending";
    if (status === 10) return "Unpaid";
    if (status === 20) return "Shipped";
    if (status === 30) return "Completed";
    if (status === 40) return "Cancelled";
    return "Unknown";
  };


  const getStatusColor = (status: number) => {
    if (status === 0) return COLORS.status.pending;
    if (status === 10) return COLORS.status.unpaid;
    if (status === 20) return COLORS.status.shipped;
    if (status === 30) return COLORS.status.completed;
    if (status === 40) return COLORS.status.cancelled;
    return 'default';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!data.id) {
    return (
        <div className="max-w-6xl mx-auto p-6">
          <p>Order not found.</p>
        </div>
    );
  }

  return (
      <div className="max-w-6xl mx-auto md:p-6 space-y-4 md:space-y-6 bg-white">
        {/* 手机端：顶部标题栏 - 使用ChevronLeftIcon */}
        <div className="flex md:hidden items-center gap-2 p-3 border-b border-default-100">
          {onBack && (
              <Button isIconOnly size="sm" variant="light" onPress={onBack}>
                <ChevronLeftIcon className="w-5 h-5"/>
              </Button>
          )}
          <h1 className="text-lg font-bold">Order #{data.no || data.id}</h1>
        </div>

        {/* 手机端内容容器 */}
        <div className="md:hidden px-2 pb-8 space-y-6">

          {/* 1. Information区块 - 减少内边距 */}
          <div className="border border-default-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3 space-y-3 bg-white">
              <div className="flex justify-between items-center text-sm">
                <span className={COLORS.text.tertiary}>Order Id:</span>
                <span className={`font-bold ${COLORS.text.primary}`}>#{data.no || data.id}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className={COLORS.text.tertiary}>Placed On:</span>
                <span className={`font-medium ${COLORS.text.secondary}`}>{formatDate(data.createTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-default-500 text-sm">Status:</span>
                <Chip
                    variant="flat"
                    color={getStatusColor(data.status)}
                    classNames={{
                      base: `font-bold ${getStatusColor(data.status) === 'warning' ? 'bg-orange-100 text-orange-600' : ''}`,
                      content: 'text-sm'
                    }}
                    size="sm"
                >
                  {getStatusText(data.status)}
                </Chip>
              </div>
            </div>
            {/* 操作按钮 - 优化交互效果 */}
            <div className={`flex border-t ${COLORS.border.medium}`}>
              <Button
                  variant="light"
                  radius="none"
                  className={`flex-1 h-12 font-bold border-r ${COLORS.border.medium} ${COLORS.text.primary} hover:bg-default-100 active:bg-default-200 transition-colors duration-150`}
              >
                Reorder
              </Button>
              {data.status === 0 && (
                  <Button
                      variant="light"
                      radius="none"
                      className={`flex-1 h-12 font-bold ${COLORS.text.secondary} hover:bg-default-100 active:bg-default-200 transition-colors duration-150`}
                  >
                    Cancel
                  </Button>
              )}
            </div>
          </div>

          {/* --- 商品明细表格 --- */}
          <div className="space-y-2">
            <h3 className={`px-1 font-bold text-lg ${COLORS.text.primary}`}>Products</h3>
            <div className={`${COLORS.border.medium} rounded-xl overflow-hidden shadow-sm`}>
              <Table
                  removeWrapper
                  aria-label="Order Items"
                  classNames={{
                    th: `${COLORS.background.primary} ${COLORS.text.tertiary} font-bold h-12 text-xs uppercase tracking-wider`,
                    td: `py-4 border-b ${COLORS.border.light} last:border-b-0 hover:bg-default-50 transition-colors duration-150`
                  }}
              >
                <TableHeader>
                  <TableColumn className="font-semibold">PRODUCT</TableColumn>
                  <TableColumn className={`text-right font-semibold ${COLORS.text.tertiary}`}>SUBTOTAL</TableColumn>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-default-50">
                        <TableCell>
                          <User
                              avatarProps={{src: item.picUrl, size: "sm", radius: "md"}}
                              name={<span
                                  className={`text-sm font-bold ${COLORS.text.primary} line-clamp-1`}>{item.spuName}</span>}
                              description={
                                <div className="space-y-0.5">
                                  {item.properties && (
                                      <p className={`text-tiny ${COLORS.text.muted}`}>
                                        {item.properties.map((p) => p.valueName).join(" / ")}
                                      </p>
                                  )}
                                  <p className={`text-tiny ${COLORS.text.primary} font-medium`}>
                                    {item.count} × {fenToYuan(item.price)}
                                  </p>
                                </div>
                              }
                          />
                        </TableCell>
                        <TableCell className={`text-right font-bold text-sm ${COLORS.text.primary}`}>
                          {fenToYuan(item.payPrice)}
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 2. Order Summary区块 - 优化阴影和边框 */}
          <div className="space-y-2">
            <h3 className={`px-1 font-bold text-lg ${COLORS.text.primary}`}>Order Summary</h3>
            <div className={`${COLORS.background.primary} rounded-xl p-3 space-y-3 shadow-sm`}>
              {[
                {label: "Subtotal", value: fenToYuan(data.totalPrice)},
                {label: "Shipping & Handling", value: fenToYuan(data.deliveryPrice)},
                {label: "Tax", value: "$0.00"},
                {label: "Grand Total", value: fenToYuan(data.payPrice), bold: true},
                {label: "Total Paid", value: fenToYuan(data.payPrice * (data.payStatus ? 1 : 0)), small: true},
                {label: "Total Refunded", value: fenToYuan(data.refundPrice), small: true},
                {label: "Total Due", value: fenToYuan(data.payPrice * (data.payStatus ? 0 : 1)), bold: true}
              ].map((item, index) => (
                  <div key={index}
                       className={`flex justify-between ${item.bold ? 'font-bold text-base' : 'text-sm'} ${item.small ? COLORS.text.muted + ' text-xs' : ''}`}>
                    <span className={item.bold ? COLORS.text.primary : COLORS.text.tertiary}>{item.label}</span>
                    <span className={item.bold ? COLORS.text.primary : COLORS.text.secondary}>{item.value}</span>
                  </div>
              ))}
            </div>
          </div>

          {/* 3. Shipping & Payment Details区块 - 优化阴影和边框 */}
          <div className="space-y-2">
            <h3 className={`px-1 font-bold text-lg ${COLORS.text.primary}`}>Shipping & Payment Details</h3>
            <div className={`${COLORS.background.primary} rounded-xl p-3 space-y-6 shadow-sm`}>
              {/* 地址信息 - 优化文字颜色 */}
              <div className="space-y-1">
                <h4 className={`${COLORS.text.tertiary} text-sm`}>Shipping Address</h4>
                <p className={`font-bold ${COLORS.text.primary}`}>{data.receiverAddress?.companyName || 'comp'}</p>
                <p className={`text-sm leading-relaxed ${COLORS.text.primary}`}>
                  {data.receiverAddress?.firstName} {data.receiverAddress?.lastName} {data.receiverAddress?.address} {data.receiverAddress?.city} {data.receiverAddress?.country} ({data.receiverAddress?.postcode})
                </p>
                <p className={`text-sm ${COLORS.text.secondary}`}>Contact : {data.receiverAddress?.phone}</p>
              </div>

              <div className="space-y-1">
                <h4 className={`${COLORS.text.tertiary} text-sm`}>Billing Address</h4>
                <p className={`font-bold ${COLORS.text.primary}`}>{data.billingAddress?.companyName || 'comp'}</p>
                <p className={`text-sm leading-relaxed ${COLORS.text.primary}`}>
                  {data.billingAddress?.firstName} {data.billingAddress?.lastName} {data.billingAddress?.address} {data.billingAddress?.city} {data.billingAddress?.country} ({data.billingAddress?.postcode})
                </p>
                <p className={`text-sm ${COLORS.text.secondary}`}>Contact : {data.billingAddress?.phone}</p>
              </div>

              <div className="space-y-1">
                <h4 className={`${COLORS.text.tertiary} text-sm`}>Shipping Method</h4>
                <p className={`text-sm font-medium ${COLORS.text.secondary}`}>{data.logisticsName || 'Free Shipping'} - {data.logisticsNo || 'Free Shipping'}</p>
              </div>

              <div className="space-y-1">
                <h4 className={`${COLORS.text.tertiary} text-sm`}>Payment Method</h4>
                <p className={`text-sm font-medium ${COLORS.text.secondary}`}>{data.payChannelName || 'Money Transfer'}</p>
              </div>
            </div>
          </div>

          {/* 4. 订单时间线 - 优化阴影和边框 */}
          <div className="space-y-2">
            <h3 className={`px-1 font-bold text-lg ${COLORS.text.primary}`}>Order Timeline</h3>
            <div className="space-y-4">
              {data.createTime && (
                  <div className="flex gap-3 group">
                    <div className="flex flex-col items-center">
                      <div
                          className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"/>
                      <div className="w-0.5 h-10 bg-default-200"/>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${COLORS.text.primary}`}>Order Placed</p>
                      <p className={`text-tiny ${COLORS.text.tertiary}`}>{formatDate(data.createTime)}</p>
                    </div>
                  </div>
              )}
              {data.payTime && (
                  <div className="flex gap-3 group">
                    <div className="flex flex-col items-center">
                      <div
                          className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"/>
                      <div className="w-0.5 h-10 bg-default-200"/>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${COLORS.text.primary}`}>Payment Confirmed</p>
                      <p className={`text-tiny ${COLORS.text.tertiary}`}>{formatDate(data.payTime)}</p>
                      <p className={`text-tiny ${COLORS.text.tertiary}`}>{data.payChannelName}</p>
                    </div>
                  </div>
              )}
              {data.deliveryTime && (
                  <div className="flex gap-3 group">
                    <div className="flex flex-col items-center">
                      <div
                          className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"/>
                      <div className="w-0.5 h-10 bg-default-200"/>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${COLORS.text.primary}`}>Order Shipped</p>
                      <p className={`text-tiny ${COLORS.text.tertiary}`}>{formatDate(data.deliveryTime)}</p>
                      {data.logisticsName && (
                          <p className={`text-tiny ${COLORS.text.tertiary}`}>{data.logisticsName} - {data.logisticsNo}</p>
                      )}
                    </div>
                  </div>
              )}
              {data.receiveTime && (
                  <div className="flex gap-3 group">
                    <div className="flex flex-col items-center">
                      <div
                          className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"/>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${COLORS.text.primary}`}>Order Delivered</p>
                      <p className={`text-tiny ${COLORS.text.tertiary}`}>{formatDate(data.receiveTime)}</p>
                    </div>
                  </div>
              )}
              {data.cancelTime && (
                  <div className="flex gap-3 group">
                    <div className="flex flex-col items-center">
                      <div
                          className="w-2.5 h-2.5 rounded-full bg-danger shadow-sm ring-2 ring-danger/20 group-hover:ring-danger/40 transition-all duration-300"/>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm text-danger ${COLORS.text.primary}`}>Order Cancelled</p>
                      <p className={`text-tiny ${COLORS.text.tertiary}`}>{formatDate(data.cancelTime)}</p>
                    </div>
                  </div>
              )}
              {data.finishTime && (
                  <div className="flex gap-3 group">
                    <div className="flex flex-col items-center">
                      <div
                          className="w-2.5 h-2.5 rounded-full bg-success shadow-sm ring-2 ring-success/20 group-hover:ring-success/40 transition-all duration-300"/>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm text-success ${COLORS.text.primary}`}>Order Completed</p>
                      <p className={`text-tiny ${COLORS.text.tertiary}`}>{formatDate(data.finishTime)}</p>
                    </div>
                  </div>
              )}
            </div>
          </div>

        </div>

        {/* PC端 */}
        <div className="hidden md:block py-8 px-4 space-y-8">
          {/* 1. 顶部标题与操作栏 - 优化边框和文字颜色 */}
          <div className={`flex justify-between items-end border-b-2 ${COLORS.border.light} pb-4`}>
            <div className="flex items-center gap-4">
              {onBack && (
                  <Button variant="light" radius="sm" className={`font-semibold px-4 ${COLORS.text.primary}`}
                          onPress={onBack}>
                    <ChevronLeftIcon className="w-5 h-5"/>
                  </Button>
              )}
              <h1 className={`text-2xl font-bold ${COLORS.text.primary}`}>Order #{data.no || data.id}</h1>
            </div>
            <div className="flex gap-3">
              <Button
                  variant="bordered"
                  radius="sm"
                  className={`font-semibold px-6 ${COLORS.border.dark} hover:bg-default-50 active:bg-default-100 transition-colors duration-150`}
              >
                Reorder
              </Button>
              {data.status === 0 && (
                  <Button
                      variant="bordered"
                      radius="sm"
                      className={`font-semibold px-6 ${COLORS.border.dark} hover:bg-default-50 active:bg-default-100 transition-colors duration-150`}
                  >
                    Cancel
                  </Button>
              )}
            </div>
          </div>

          {/* 2. Information 标题区块 - 优化背景和边框 */}
          <div className="space-y-4">
            <div className={`${COLORS.background.primary} p-4 rounded-t-sm border-l-4 ${COLORS.border.dark}`}>
              <h2 className={`text-xl font-bold ${COLORS.text.primary}`}>Information</h2>
            </div>
            <div className={`px-1 ${COLORS.text.secondary} font-medium`}>
              Placed On {formatDate(data.createTime)}
            </div>
          </div>

          {/* 3. 商品明细表格 (PC端五列布局) - 优化表格样式 */}
          <Table
              removeWrapper
              aria-label="Order Items Table"
              classNames={{
                base: `border-t ${COLORS.border.light}`,
                th: `${COLORS.background.primary} ${COLORS.text.tertiary} font-bold py-4 text-xs uppercase tracking-wider first:rounded-none last:rounded-none`,
                td: `py-5 border-b ${COLORS.border.light} ${COLORS.text.primary} hover:bg-default-50 transition-colors duration-150`
              }}
          >
            <TableHeader>
              <TableColumn className="font-semibold">SKU</TableColumn>
              <TableColumn width={400} className="font-semibold">Name</TableColumn>
              <TableColumn className="font-semibold">Price</TableColumn>
              <TableColumn className="font-semibold">Item Status</TableColumn>
              <TableColumn className={`text-right font-semibold ${COLORS.text.tertiary}`}>Subtotal</TableColumn>
            </TableHeader>
            <TableBody>
              {data.items?.map((item) => (
                  <TableRow key={item.id} className="hover:bg-default-50">
                    {/* SKU: 接口中一般对应 skuId 或自定义编号 */}
                    <TableCell className={`font-medium ${COLORS.text.secondary}`}>SKU-{item.skuId}</TableCell>
                    <TableCell>
                      <div className={`font-bold ${COLORS.text.primary}`}>{item.spuName}</div>
                      {item.properties && (
                          <div className={`text-tiny ${COLORS.text.muted} mt-1`}>
                            {item.properties.map(p => p.valueName).join(' / ')}
                          </div>
                      )}
                    </TableCell>
                    <TableCell className={COLORS.text.secondary}>{fenToYuan(item.price)}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${COLORS.text.primary}`}>Ordered ({item.count})</span>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${COLORS.text.primary}`}>
                      {fenToYuan(item.payPrice)}
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 4. 结算区块 (右对齐) - 优化文字颜色和边框 */}
          <div className="flex justify-end pr-4">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className={COLORS.text.tertiary}>Subtotal</span>
                <span className={`font-medium ${COLORS.text.secondary}`}>{fenToYuan(data.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={COLORS.text.tertiary}>Shipping & Handling</span>
                <span className={`font-medium ${COLORS.text.secondary}`}>{fenToYuan(data.deliveryPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={COLORS.text.tertiary}>Tax</span>
                <span className={`font-medium ${COLORS.text.secondary}`}>$0.00</span>
              </div>
              <div className={`flex justify-between text-base font-bold pt-2 border-t ${COLORS.border.light}`}>
                <span className={COLORS.text.primary}>Grand Total</span>
                <span className={COLORS.text.primary}>{fenToYuan(data.payPrice)}</span>
              </div>
              <div className={`flex justify-between text-sm ${COLORS.text.tertiary}`}>
                <span>Total Paid</span>
                <span className={COLORS.text.secondary}>{fenToYuan(data.payPrice * (data.payStatus ? 1 : 0))}</span>
              </div>
              <div className={`flex justify-between text-sm ${COLORS.text.tertiary}`}>
                <span>Total Refunded</span>
                <span className={COLORS.text.secondary}>{fenToYuan(data.refundPrice)}</span>
              </div>
              <div className={`flex justify-between text-base font-bold ${COLORS.text.primary}`}>
                <span>Total Due</span>
                <span className={COLORS.text.primary}>{fenToYuan(data.payPrice * (data.payStatus ? 0 : 1))}</span>
              </div>
            </div>
          </div>

          {/* 5. 底部地址与方式 (五列平铺) - 优化边框和文字颜色 */}
          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pt-12 border-t ${COLORS.border.light}`}>
            {/* Billing Address */}
            <div className="space-y-10">
              <h3 className={`${COLORS.text.tertiary} font-medium`}>Billing Address</h3>
              <div className="text-sm leading-relaxed space-y-1">
                <p className={`font-bold ${COLORS.text.primary}`}>{data.billingAddress?.companyName || 'comp'}</p>
                <p className={`font-bold ${COLORS.text.primary}`}>
                  {data.billingAddress?.firstName} {data.billingAddress?.lastName}
                </p>
                <p className={COLORS.text.secondary}>{data.billingAddress?.address}</p>
                <p className={COLORS.text.secondary}>{data.billingAddress?.city} {data.billingAddress?.state} {data.billingAddress?.country} ({data.billingAddress?.postcode})</p>
                <p className={`pt-2 ${COLORS.text.tertiary}`}>Contact : {data.billingAddress?.phone}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-10">
              <h3 className="text-default-400 font-medium">Shipping Address</h3>
              <div className="text-sm leading-relaxed space-y-1">
                <p className="font-bold text-default-800">{data.receiverAddress?.companyName || 'comp'}</p>
                <p className="font-bold text-default-800">
                  {data.receiverAddress?.firstName} {data.receiverAddress?.lastName}
                </p>
                <p>{data.receiverAddress?.address}</p>
                <p>{data.receiverAddress?.city} {data.receiverAddress?.state} {data.receiverAddress?.country} ({data.receiverAddress?.postcode})</p>
                <p className="pt-2 text-default-500">Contact : {data.receiverAddress?.phone}</p>
              </div>
            </div>

            {/* Business Address */}
            <div className="space-y-3">
              <h3 className="text-default-400 font-medium">Business Address</h3>
              <div className="text-sm leading-relaxed space-y-1">
                <p className="font-bold text-default-800">{data.businessAddress?.companyName || 'comp'}</p>
                <p className="font-bold text-default-800">
                  {data.businessAddress?.firstName} {data.businessAddress?.lastName}
                </p>
                <p>{data.businessAddress?.address}</p>
                <p>{data.businessAddress?.city} {data.businessAddress?.state} {data.businessAddress?.country} ({data.businessAddress?.postcode})</p>
                <p className="pt-2 text-default-500">Contact : {data.businessAddress?.phone}</p>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="space-y-3">
              <h3 className="text-default-400 font-medium">Shipping Method</h3>
              <p className="text-sm font-medium text-default-800">
                {data.logisticsName || 'Free Shipping'} - {data.logisticsNo || 'Free Shipping'}
              </p>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h3 className="text-default-400 font-medium">Payment Method</h3>
              <p className="text-sm font-medium text-default-800">
                {data.payChannelName || 'Money Transfer'}
              </p>
            </div>
          </div>

          {/* 6. 订单时间线 - 优化文字颜色 */}
          <div className="space-y-4">
            <h3 className={`text-xl font-bold ${COLORS.text.primary}`}>Order Timeline</h3>
            <div className="space-y-4">
              {data.createTime && (
                  <div className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div
                          className="w-3 h-3 rounded-full bg-primary shadow-md ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"/>
                      <div className="w-0.5 h-12 bg-default-200"/>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${COLORS.text.primary}`}>Order Placed</p>
                      <p className={`text-sm ${COLORS.text.tertiary}`}>{formatDate(data.createTime)}</p>
                    </div>
                  </div>
              )}
              {data.payTime && (
                  <div className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div
                          className="w-3 h-3 rounded-full bg-primary shadow-md ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"/>
                      <div className="w-0.5 h-12 bg-default-200"/>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${COLORS.text.primary}`}>Payment Confirmed</p>
                      <p className={`text-sm ${COLORS.text.tertiary}`}>{formatDate(data.payTime)}</p>
                      <p className={`text-sm ${COLORS.text.tertiary}`}>{data.payChannelName}</p>
                    </div>
                  </div>
              )}
              {data.deliveryTime && (
                  <div className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div
                          className="w-3 h-3 rounded-full bg-primary shadow-md ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"/>
                      <div className="w-0.5 h-12 bg-default-200"/>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${COLORS.text.primary}`}>Order Shipped</p>
                      <p className={`text-sm ${COLORS.text.tertiary}`}>{formatDate(data.deliveryTime)}</p>
                      {data.logisticsName && (
                          <p className={`text-sm ${COLORS.text.tertiary}`}>{data.logisticsName} - {data.logisticsNo}</p>
                      )}
                    </div>
                  </div>
              )}
              {data.receiveTime && (
                  <div className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div
                          className="w-3 h-3 rounded-full bg-primary shadow-md ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"/>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${COLORS.text.primary}`}>Order Delivered</p>
                      <p className={`text-sm ${COLORS.text.tertiary}`}>{formatDate(data.receiveTime)}</p>
                    </div>
                  </div>
              )}
              {data.cancelTime && (
                  <div className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div
                          className="w-3 h-3 rounded-full bg-danger shadow-md ring-2 ring-danger/20 group-hover:ring-danger/40 transition-all duration-300"/>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-danger ${COLORS.text.primary}`}>Order Cancelled</p>
                      <p className={`text-sm ${COLORS.text.tertiary}`}>{formatDate(data.cancelTime)}</p>
                    </div>
                  </div>
              )}
              {data.finishTime && (
                  <div className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div
                          className="w-3 h-3 rounded-full bg-success shadow-md ring-2 ring-success/20 group-hover:ring-success/40 transition-all duration-300"/>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-success ${COLORS.text.primary}`}>Order Completed</p>
                      <p className={`text-sm ${COLORS.text.tertiary}`}>{formatDate(data.finishTime)}</p>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>

      </div>
  );
};

export default OrderDetailView;