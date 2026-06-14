"use client";

import {Button, Card, CardBody, Divider, Spinner, Textarea, User} from "@heroui/react";
import {ChevronLeftIcon} from "@heroicons/react/24/outline";
import {createB2BOrder, getFinalQuotation, type AppTradeOrderAddressReqVO} from "@utils/api/b2b";
import type {AddressLine} from "@/types/api/address/type";
import {useMutation, useQuery} from "@tanstack/react-query";
import {useLocale, useTranslations} from "next-intl";
import {fenToYuan} from "@utils/formatNumber";
import {useCustomToast} from "@utils/hooks/useToast";
import {useRouter} from "next/navigation";
import {AddAddressForm} from "@components/checkout/stepper/address";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {useCallback, useEffect, useState} from "react";
import clsx from "clsx";
import {resetCheckoutState} from "@/store/slices/checkout-slice";

interface B2BOrderConfirmationViewProps {
  rfqId: number;
  onBack: () => void;
}

export const B2BOrderConfirmationView = ({rfqId, onBack}: B2BOrderConfirmationViewProps) => {
  const t = useTranslations("b2b.orderConfirmation");
  const locale = useLocale();  // ✅ 获取当前语言，用于 i18n 路由
  const {showToast} = useCustomToast();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux 状态
  const {
    billingAddress,
    receiverAddress,
    importerAddress,
    receiveUseBilling,
    importerUseBilling,
  } = useAppSelector((state) => state.checkout);

  const [remark, setRemark] = useState("");
  const [step, setStep] = useState<'address' | 'confirm'>('address');

  // 页面加载时重置 checkout 状态
  const resetState = useCallback(() => {
    dispatch(resetCheckoutState());
  }, [dispatch]);

  useEffect(() => {
    resetState();
  }, [resetState]);

  // 获取最终报价（比价后的结果）
  const {data: quotationData, isLoading} = useQuery({
    queryKey: ["b2bFinalQuotation", rfqId],
    queryFn: () => getFinalQuotation(rfqId),
  });

  // 转换 AddressLine 到 AppTradeOrderAddressReqVO
  const convertToAddressReqVO = (address: AddressLine | null): AppTradeOrderAddressReqVO => {
    if (!address) {
      return {
        name: '',
        mobile: '',
        detailAddress: '',
        country: '',
        state: '',
        city: '',
        postcode: '',
        email: '',
        companyName: '',
        vat: '',
        eori: '',
      };
    }
    return {
      name: `${address.firstName || ''} ${address.lastName || ''}`.trim(),
      mobile: address.phone || '',
      detailAddress: address.address || '',
      country: address.country || '',
      state: address.state || '',
      city: address.city || '',
      postcode: address.postcode || '',
      email: address.email || '',
      companyName: address.companyName || '',
      vat: address.vat || '',
      eori: address.eori || '',
    };
  };

  // 创建订单 mutation
  const createOrderMutation = useMutation({
    mutationFn: createB2BOrder,
    onSuccess: () => {
      showToast(t("orderCreatedSuccess"), "success");
      // ✅ 修复：必须加上 locale 前缀，否则 i18n 路由不匹配
      router.push(`/${locale}/account/b2b-orders`);
    },
    onError: (error: Error) => {
      showToast(error.message || t("orderCreatedFailed"), "danger");
    },
  });

  // 处理地址下一步
  const handleNextStep = () => {
    if (!billingAddress) {
      showToast(t("billingAddressRequired"), "danger");
      return;
    }
    if (!receiveUseBilling && !receiverAddress) {
      showToast(t("receiverAddressRequired"), "danger");
      return;
    }
    if (!importerUseBilling && !importerAddress) {
      showToast(t("importerAddressRequired"), "danger");
      return;
    }
    setStep('confirm');
  };

  // 提交订单
  const handleSubmitOrder = () => {
    if (!quotationData) return;

    const actualReceiverAddress = receiveUseBilling ? billingAddress : receiverAddress;
    const actualImporterAddress = importerUseBilling ? billingAddress : importerAddress;

    if (!actualReceiverAddress || !actualImporterAddress) return;

    createOrderMutation.mutate({
      rfqId: rfqId,
      remark: remark,
      receiveUseBilling,
      importerUseBilling,
      billingAddress: convertToAddressReqVO(billingAddress),
      receiverAddress: convertToAddressReqVO(actualReceiverAddress),
      importerAddress: convertToAddressReqVO(actualImporterAddress),
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 加载状态
  if (isLoading || !quotationData) {
    return (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg"/>
        </div>
    );
  }

  // 如果没有获取到最终报价，显示无效提示
  if (!quotationData) {
    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          <div className="mb-6 flex items-center gap-4">
            <Button size="sm" variant="light" onPress={onBack}>
              <ChevronLeftIcon className="mr-1 h-4 w-4"/>
              {t("back")}
            </Button>
            <h2 className="text-2xl font-bold">{t("title")}</h2>
          </div>
          <Card>
            <CardBody className="py-10 text-center">
              <p className="text-default-500">{t("quotationNotValid")}</p>
            </CardBody>
          </Card>
        </div>
    );
  }

  return (
      <div className="mx-auto max-w-6xl space-y-6 bg-white p-4 md:p-6 dark:bg-gray-900">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button size="sm" variant="light" onPress={onBack}>
              <ChevronLeftIcon className="w-4 h-4 mr-1"/>
              {t("back")}
            </Button>
            <h2 className="text-2xl font-bold">{t("title")}</h2>
          </div>
          {step === 'confirm' && (
              <Button
                  color="primary"
                  isLoading={createOrderMutation.isPending}
                  onPress={handleSubmitOrder}
              >
                {t("submitOrder")}
              </Button>
          )}
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center gap-4 border-b border-default-200 pb-4 dark:border-gray-700">
          <div className={clsx(
              "flex items-center gap-2",
              step === 'address' ? "font-bold text-primary" : "text-default-500"
          )}>
            <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-white">1</span>
            {t("stepAddress")}
          </div>
          <Divider className="flex-1"/>
          <div className={clsx(
              "flex items-center gap-2",
              step === 'confirm' ? "font-bold text-primary" : "text-default-500"
          )}>
            <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-white">2</span>
            {t("stepConfirm")}
          </div>
        </div>

        {/* 桌面端布局 */}
        <div className="hidden lg:grid grid-cols-2 gap-6">
          {/* 左侧：地址表单 / 订单确认 */}
          <div className="space-y-6">
            {step === 'address' ? (
                <Card>
                  <CardBody className="space-y-4">
                    <h3 className="text-lg font-semibold dark:text-white">{t("addressInfo")}</h3>
                    <AddAddressForm
                        autoNavigate={false}
                        onNextStep={handleNextStep}
                    />
                  </CardBody>
                </Card>
            ) : (
                <>
                  {/* 地址确认 */}
                  <Card>
                    <CardBody className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold dark:text-white">{t("addressConfirm")}</h3>
                        <Button size="sm" variant="light" onPress={() => setStep('address')}>
                          {t("edit")}
                        </Button>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-default-500">{t("billingAddress")}:</span>
                          <p className="mt-1">
                            {billingAddress?.firstName} {billingAddress?.lastName}<br/>
                            {billingAddress?.address}, {billingAddress?.city}, {billingAddress?.state}, {billingAddress?.country}<br/>
                            {billingAddress?.phone}
                          </p>
                        </div>
                        <Divider/>
                        <div>
                          <span className="text-default-500">{t("receiverAddress")}:</span>
                          <p className="mt-1">
                            {receiveUseBilling ? t("sameAsBilling") : (
                                <>
                                  {receiverAddress?.firstName} {receiverAddress?.lastName}<br/>
                                  {receiverAddress?.address}, {receiverAddress?.city}, {receiverAddress?.state}, {receiverAddress?.country}<br/>
                                  {receiverAddress?.phone}
                                </>
                            )}
                          </p>
                        </div>
                        <Divider/>
                        <div>
                          <span className="text-default-500">{t("importerAddress")}:</span>
                          <p className="mt-1">
                            {importerUseBilling ? t("sameAsBilling") : (
                                <>
                                  {importerAddress?.firstName} {importerAddress?.lastName}<br/>
                                  {importerAddress?.address}, {importerAddress?.city}, {importerAddress?.state}, {importerAddress?.country}<br/>
                                  {importerAddress?.phone}
                                  {importerAddress?.companyName && ` - ${importerAddress.companyName}`}
                                </>
                            )}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* 备注 */}
                  <Card>
                    <CardBody>
                      <Textarea
                          label={t("remark")}
                          placeholder={t("remarkPlaceholder")}
                          value={remark}
                          onValueChange={setRemark}
                      />
                    </CardBody>
                  </Card>
                </>
            )}
          </div>

          {/* 右侧：商品清单和价格摘要 */}
          <div className="space-y-6">
            {/* 报价单基本信息 */}
            <Card>
              <CardBody className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-default-500">{t("currency")}:</span>
                  <span>{quotationData.currency}</span>
                </div>
                {quotationData.incoterms && (
                    <div className="flex justify-between">
                      <span className="text-default-500">{t("incoterms")}:</span>
                      <span>{quotationData.incoterms}</span>
                    </div>
                )}
                {quotationData.validUntil && (
                    <div className="flex justify-between">
                      <span className="text-default-500">{t("validUntil")}:</span>
                      <span>{formatDate(quotationData.validUntil)}</span>
                    </div>
                )}
              </CardBody>
            </Card>

            {/* 商品清单 */}
            <Card>
              <CardBody className="space-y-4">
                <h3 className="text-lg font-semibold dark:text-white">{t("items")}</h3>
                <div className="space-y-3">
                  {quotationData.items.map((item, index) => (
                      <div key={index}>
                        {index > 0 && <Divider className="my-3"/>}
                        <User
                            avatarProps={{src: item.picUrl, size: "md", radius: "md"}}
                            name={<span className="text-sm font-bold line-clamp-1">{item.spuName}</span>}
                            description={
                              <div className="space-y-0.5">
                                <p className="text-tiny text-default-500">{item.skuName}</p>
                                <p className="text-tiny font-medium">
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

            {/* 价格摘要 */}
            <Card className="bg-default-50 dark:bg-gray-800">
              <CardBody className="space-y-3">
                <h3 className="text-lg font-semibold dark:text-white">{t("priceSummary")}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-default-500">{t("subtotal")}:</span>
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
          </div>
        </div>

        {/* 手机端布局 - 简洁设计，无外框 */}
        <div className="lg:hidden space-y-0 divide-y divide-default-100">
          {/* 步骤1：地址表单 */}
          {step === 'address' ? (
              <div className="-mx-4 px-4 py-4">
                <h3 className="text-base font-semibold mb-4">{t("addressInfo")}</h3>
                <AddAddressForm
                    autoNavigate={false}
                    onNextStep={handleNextStep}
                />
              </div>
          ) : (
              <>
                {/* 地址确认 */}
                <div className="-mx-4 px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">{t("addressConfirm")}</h3>
                    <Button size="sm" variant="light" onPress={() => setStep('address')}>
                      {t("edit")}
                    </Button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-default-500">{t("billingAddress")}:</span>
                      <p className="mt-1">
                        {billingAddress?.firstName} {billingAddress?.lastName}<br/>
                        {billingAddress?.address}, {billingAddress?.city}, {billingAddress?.state}, {billingAddress?.country}<br/>
                        {billingAddress?.phone}
                      </p>
                    </div>
                    <div className="border-t border-default-100 pt-3">
                      <span className="text-default-500">{t("receiverAddress")}:</span>
                      <p className="mt-1">
                        {receiveUseBilling ? t("sameAsBilling") : (
                            <>
                              {receiverAddress?.firstName} {receiverAddress?.lastName}<br/>
                              {receiverAddress?.address}, {receiverAddress?.city}, {receiverAddress?.state}, {receiverAddress?.country}<br/>
                              {receiverAddress?.phone}
                            </>
                        )}
                      </p>
                    </div>
                    <div className="border-t border-default-100 pt-3">
                      <span className="text-default-500">{t("importerAddress")}:</span>
                      <p className="mt-1">
                        {importerUseBilling ? t("sameAsBilling") : (
                            <>
                              {importerAddress?.firstName} {importerAddress?.lastName}<br/>
                              {importerAddress?.address}, {importerAddress?.city}, {importerAddress?.state}, {importerAddress?.country}<br/>
                              {importerAddress?.phone}
                              {importerAddress?.companyName && ` - ${importerAddress.companyName}`}
                            </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 备注 */}
                <div className="-mx-4 px-4 py-4">
                  <Textarea
                      label={t("remark")}
                      placeholder={t("remarkPlaceholder")}
                      value={remark}
                      onValueChange={setRemark}
                  />
                </div>

                {/* 报价单基本信息 */}
                <div className="-mx-4 px-4 py-4">
                  <h3 className="text-base font-semibold mb-3">{t("quotationInfo")}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-default-500">{t("currency")}:</span>
                      <span>{quotationData.currency}</span>
                    </div>
                    {quotationData.incoterms && (
                        <div className="flex justify-between">
                          <span className="text-default-500">{t("incoterms")}:</span>
                          <span>{quotationData.incoterms}</span>
                        </div>
                    )}
                    {quotationData.validUntil && (
                        <div className="flex justify-between">
                          <span className="text-default-500">{t("validUntil")}:</span>
                          <span>{formatDate(quotationData.validUntil)}</span>
                        </div>
                    )}
                  </div>
                </div>

                {/* 商品清单 */}
                <div className="-mx-4 px-4 py-4">
                  <h3 className="text-base font-semibold mb-3">{t("items")}</h3>
                  <div className="space-y-3">
                    {quotationData.items.map((item, index) => (
                        <div key={index} className={index > 0 ? "pt-3 border-t border-default-100" : ""}>
                          <User
                              avatarProps={{src: item.picUrl, size: "md", radius: "md"}}
                              name={<span className="text-sm font-bold line-clamp-1">{item.spuName}</span>}
                              description={
                                <div className="space-y-0.5">
                                  <p className="text-tiny text-default-500">{item.skuName}</p>
                                  <p className="text-tiny font-medium">
                                    {t("quantity")}: {item.count} × {fenToYuan(item.unitPrice)} = {fenToYuan(item.totalPrice)}
                                  </p>
                                </div>
                              }
                          />
                        </div>
                    ))}
                  </div>
                </div>

                {/* 价格摘要 */}
                <div className="-mx-4 px-4 py-4">
                  <div className="bg-default-50 rounded-lg p-3">
                    <h3 className="text-base font-semibold mb-3">{t("priceSummary")}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-default-500">{t("subtotal")}:</span>
                        <span>{fenToYuan(quotationData.items.reduce((sum, item) => sum + item.totalPrice, 0))}</span>
                      </div>
                      <div className="border-t border-default-200 my-1"/>
                      <div className="flex justify-between font-bold">
                        <span>{t("total")}:</span>
                        <span>{fenToYuan(quotationData.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
          )}
        </div>
      </div>
  );
};