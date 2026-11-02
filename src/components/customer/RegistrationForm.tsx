"use client";

import Image from "next/image";
import Link from "@/components/common/Link";
import {SubmitHandler, useForm} from "react-hook-form";
import InputText from "@components/common/form/Input";
import {useCustomToast} from "@/utils/hooks/useToast";
import {useRouter} from "next/navigation";
import {EMAIL_REGEX, IS_VALID_INPUT, SIGNUP_IMG} from "@utils/constants";
import {RegisterRequest, registerUser} from "@utils/api/member";
import {Button} from "@components/common/button/Button";
import {useTranslations} from "next-intl";
import {trackEvent} from "@/lib/analytics";

export type RegisterInputs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export default function RegistrationForm() {
  const router = useRouter();
  const t = useTranslations("auth");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInputs>({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { showToast } = useCustomToast();

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    try {
      const payload: RegisterRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.passwordConfirmation,
      };

      const success = await registerUser(payload);

      if (success) {
        // ✅ 注册成功触发 sign_up 事件
        trackEvent("sign_up", {method: "email"});
        showToast("User created successfully", "success");
        router.replace("/customer/login");
      } else {
        // 如果 API 返回 false，但没有抛出错误，也视为失败
        throw new Error("Failed to create user. Please try again.");
      }
    } catch (error: any) {
      // 捕获 API 调用中抛出的错误
      const message = error?.message || "An error occurred during registration.";
      showToast(message, "danger");
    }
  };

  return (
    <div className="mt-5 md:my-8 md:mt-0 flex w-full items-center w-full max-w-screen-2xl mx-auto px-4 xss:px-7.5 justify-between gap-0 md:gap-4 lg:my-16 xl:my-28">
      <div className="relative flex w-full max-w-[583px] flex-col gap-y-4 lg:gap-y-12">
        <div className="font-outfit">
          <h2 className="py-1 text-2xl font-semibold sm:text-4xl">
            {t("becomeUser")}
          </h2>
          <p className="mt-2 text-base md:text-lg font-normal text-black/[60%] dark:text-neutral-400 sm:mt-2">
            {t("welcomeMessage")}
          </p>
        </div>

        <form
          noValidate
          className="flex flex-col gap-y-5 lg:gap-y-12"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-y-2.5 lg:gap-[18px]">
            <div className="flex w-full gap-2.5 lg:gap-[18px]">
              <InputText
                {...register("firstName", {
                  required: "First name is required",
                  pattern: {
                    value: IS_VALID_INPUT,
                    message: "Invalid First Name",
                  },
                })}
                className="w-full"
                errorMsg={
                  errors.firstName?.message
                    ? [errors.firstName.message]
                    : undefined
                }
                label={t("firstName")}
                labelPlacement="outside"
                name="firstName"
                placeholder={t("firstNamePlaceholder")}
                size="lg"
              />
              <InputText
                {...register("lastName",
                  {
                    required: "Last name is required",
                    pattern: {
                      value: IS_VALID_INPUT,
                      message: "Invalid Last Name",
                    },
                  })}
                className="w-full"
                errorMsg={
                  errors.lastName?.message
                    ? [errors.lastName.message]
                    : undefined
                }
                label={t("lastName")}
                labelPlacement="outside"
                name="lastName"
                placeholder={t("lastNamePlaceholder")}
                size="lg"
              />
            </div>

            <InputText
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: EMAIL_REGEX,
                  message: "Please enter a valid email.",
                },
              })}
              errorMsg={errors.email?.message}
              label={t("email")}
              labelPlacement="outside"
              name="email"
              placeholder={t("emailPlaceholder")}
              size="lg"
            />

            <InputText
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Must be at least 8 characters",
                },
                validate: (val) => {
                  if (!/[A-Z]/.test(val))
                    return "Must contain at least one uppercase letter";
                  if (!/[a-z]/.test(val))
                    return "Must contain at least one lowercase letter";
                  if (!/[0-9]/.test(val))
                    return "Must contain at least one number";
                  if (/\s/.test(val)) return "Cannot contain spaces";

                  return true;
                },
              })}
              label={t("password")}
              labelPlacement="outside"
              name="password"
              placeholder={t("passwordPlaceholder")}
              typeName="password"
              size="lg"
              errorMsg={
                errors.password?.message ? [errors.password.message] : undefined
              }
            />

            <InputText
              {...register("passwordConfirmation", {
                required: "Please confirm your password",
              })}
              label={t("confirmPassword")}
              labelPlacement="outside"
              name="passwordConfirmation"
              placeholder={t("confirmPasswordPlaceholder")}
              size="lg"
              typeName="password"
            />
          </div>

          <div className="flex flex-col gap-y-3 mb-8 lg:mb-0">
            <Button
              disabled={isSubmitting}
              loading={isSubmitting}
              title={t("signUp")}
              type="submit"
            />
            <span className="mx-auto md:mx-0 font-outfit">
              {t("alreadyHaveAccount")}{" "}
              <Link className="text-blue-600 underline" href="/customer/login" aria-label="Go to sign in page">
                {t("signIn")}
              </Link>
            </span>
          </div>
        </form>
      </div>

      <div className="relative hidden aspect-[0.9] max-h-[692px] w-full max-w-[790px] sm:block md:aspect-[1.14]">
        <Image
          fill
          priority
          alt="Sign Up Image"
          className="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
          sizes="(min-width: 768px) 66vw, 100vw"
          src={SIGNUP_IMG}
        />
      </div>
    </div>
  );
}