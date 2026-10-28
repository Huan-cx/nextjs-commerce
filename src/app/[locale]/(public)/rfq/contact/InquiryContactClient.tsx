"use client";

import {Button, Select, SelectItem, Spinner, Textarea} from "@heroui/react";
import {useMutation} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {Controller, useForm} from "react-hook-form";
import InputText from "@components/common/form/Input";
import CountrySelect from "@components/common/form/country";
import {createB2BInquiry} from "@utils/api/b2b";
import {getAttributionForRfq} from "@/lib/analytics/attribution";
import {useCustomToast} from "@utils/hooks/useToast";

interface InquiryFormData {
    email: string;
    company: string;
    country: string;
    budgetAmount: string;
    budgetCurrency: string;
    description: string;
}

const CURRENCY_OPTIONS = [
    {value: "USD", labelKey: "currencyOptions.USD"},
    {value: "EUR", labelKey: "currencyOptions.EUR"},
    {value: "CNY", labelKey: "currencyOptions.CNY"},
    {value: "GBP", labelKey: "currencyOptions.GBP"},
    {value: "JPY", labelKey: "currencyOptions.JPY"},
];

export default function InquiryContactClient() {
    const t = useTranslations("b2b.inquiry");
    const {showToast} = useCustomToast();
    const router = useRouter();

    const {
        register,
        control,
        handleSubmit,
        formState: {errors},
    } = useForm<InquiryFormData>({
        mode: "onChange",
        defaultValues: {
            email: "",
            company: "",
            country: "",
            budgetAmount: "",
            budgetCurrency: "",
            description: "",
        },
    });

    // 提交询价 Mutation
    const createInquiryMutation = useMutation({
        mutationFn: (data: InquiryFormData) =>
            createB2BInquiry({
                email: data.email,
                company: data.company,
                country: data.country,
                budgetAmount: Number(data.budgetAmount),
                budgetCurrency: data.budgetCurrency,
                description: data.description,
                ...getAttributionForRfq(),
            }),
        onSuccess: () => {
            showToast(t("success"), "success");
            router.push("/");
        },
        onError: () => {
            showToast(t("failed"), "danger");
        },
    });

    const onSubmit = handleSubmit((data) => {
        createInquiryMutation.mutate(data);
    });

    return (
        <div className="mx-auto w-full max-w-2xl py-10 px-4 sm:px-6">
            {/* 页面标题 */}
            <header className="mb-8">
                <h1 className="text-2xl font-outfit font-semibold text-black dark:text-white">
                    {t("title")}
                </h1>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    {t("subtitle")}
                </p>
            </header>

            <div
                className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-gray-800 p-6 sm:p-8">
                <InputText
                    label={t("email")}
                    placeholder={t("emailPlaceholder")}
                    type="email"
                    {...register("email", {
                        required: t("emailRequired"),
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: t("emailInvalid"),
                        },
                    })}
                    errorMsg={errors.email?.message?.toString()}
                    size="md"
                    className="max-w-full"
                />

                <InputText
                    label={t("company")}
                    placeholder={t("companyPlaceholder")}
                    {...register("company", {required: t("companyRequired")})}
                    errorMsg={errors.company?.message?.toString()}
                    size="md"
                    className="max-w-full"
                />

                <CountrySelect
                    control={control}
                    name="country"
                    label={t("country")}
                    placeholder={t("countryPlaceholder")}
                    errorMsg={errors.country?.message?.toString()}
                    rules={{required: t("countryRequired")}}
                    required
                    size="md"
                    className="max-w-full"
                />

                {/* 预算：金额 + 币种 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputText
                        label={t("budgetAmount")}
                        placeholder={t("budgetAmountPlaceholder")}
                        type="number"
                        {...register("budgetAmount", {
                            required: t("budgetAmountRequired"),
                            min: {value: 0.01, message: t("budgetAmountInvalid")},
                        })}
                        errorMsg={errors.budgetAmount?.message?.toString()}
                        size="md"
                        className="max-w-full"
                    />
                    <Controller
                        name="budgetCurrency"
                        control={control}
                        rules={{required: t("budgetCurrencyRequired")}}
                        render={({field, fieldState}) => (
                            <div className="max-w-full">
                                <label className="px-1 mb-1.5 block font-medium text-black dark:text-white text-sm">
                                    {t("budgetCurrency")} <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    placeholder={t("budgetCurrencyPlaceholder")}
                                    selectedKeys={field.value ? [field.value] : []}
                                    onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] as string)}
                                    size="md"
                                    isInvalid={!!fieldState.error}
                                    errorMessage={fieldState.error?.message?.toString()}
                                    classNames={{
                                        base: "w-full",
                                        trigger: "!rounded-[0.62rem] border border-gray-300 dark:border-gray-500 bg-transparent",
                                        value: "text-gray-900 dark:text-white",
                                    }}
                                >
                                    {CURRENCY_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} textValue={t(opt.labelKey)}>
                                            {t(opt.labelKey)}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                        )}
                    />
                </div>

                <div className="max-w-full">
                    <label className="px-1 mb-1.5 block font-medium text-black dark:text-white text-sm">
                        {t("description")} <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                        placeholder={t("descriptionPlaceholder")}
                        {...register("description", {required: t("descriptionRequired")})}
                        isInvalid={!!errors.description}
                        errorMessage={errors.description?.message?.toString()}
                        minRows={4}
                        size="lg"
                        classNames={{
                            base: "w-full",
                            inputWrapper: "!rounded-[0.62rem] border border-gray-300 dark:border-gray-500 bg-transparent",
                            input: "text-gray-900 dark:text-white",
                        }}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        color="primary"
                        size="lg"
                        onPress={() => onSubmit()}
                        isDisabled={createInquiryMutation.isPending}
                        className="font-outfit text-base font-medium"
                    >
                        {createInquiryMutation.isPending ? (
                            <Spinner size="sm" color="white"/>
                        ) : (
                            t("submit")
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
