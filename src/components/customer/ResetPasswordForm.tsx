"use client";

import {useEffect, useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

import {resetPassword, ResetPasswordRequest, validateResetToken,} from "@utils/api/member";
import {useCustomToast} from "@/utils/hooks/useToast";
import {Button} from "@components/common/button/Button";
import InputText from "@components/common/form/Input";
import {FORGET_PASSWORD_IMG} from "@/utils/constants";
import {AuthPlaceHolder} from "@components/common/skeleton/AuthPlaceHolder";

type ResetPasswordInputs = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {showToast} = useCustomToast();

  const [token, setToken] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<
      "validating" | "valid" | "invalid"
  >("validating");

  const {
    register,
    handleSubmit,
    watch,
    formState: {errors, isSubmitting},
  } = useForm<ResetPasswordInputs>({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // 1. 页面加载时，验证 URL 中的 token
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setValidationStatus("invalid");
      return;
    }
    setToken(tokenFromUrl);

    const checkToken = async () => {
      try {
        const isValid = await validateResetToken(tokenFromUrl);
        setValidationStatus(isValid ? "valid" : "invalid");
      } catch (error) {
        setValidationStatus("invalid");
        console.error("Token validation failed:", error);
      }
    };

    checkToken();
  }, [searchParams]);

  // 2. 提交新密码
  const onSubmit: SubmitHandler<ResetPasswordInputs> = async (data) => {
    if (!token) {
      showToast("Invalid or missing token.", "danger");
      return;
    }

    try {
      const payload: ResetPasswordRequest = {
        token,
        password: data.password,
      };
      const success = await resetPassword(payload);

      if (success) {
        showToast("Password has been reset successfully!", "success");
        setTimeout(() => {
          router.push("/customer/login");
        }, 1000);
      } else {
        throw new Error("Failed to reset password. Please try again.");
      }
    } catch (error: any) {
      const message =
          error?.message || "Something went wrong. Please try again.";
      showToast(message, "danger");
    }
  };

  // 渲染加载状态
  if (validationStatus === "validating") {
    return <AuthPlaceHolder/>;
  }

  // 渲染 Token 无效状态
  if (validationStatus === "invalid") {
    return (
        <div className="my-8 flex w-full flex-col items-center justify-center gap-y-4 text-center">
          <h2 className="text-2xl font-semibold sm:text-4xl">Invalid Link</h2>
          <p className="text-base text-black/60 dark:text-neutral-400">
            This password reset link is either invalid or has expired.
          </p>
          <Link href="/customer/forget-password">
            <Button title="Request a New Link"/>
          </Link>
        </div>
    );
  }

  // 渲染重置密码表单 (Token 有效)
  return (
      <div
          className="my-8 mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 px-4 xss:px-7.5 lg:my-16 xl:my-32">
        <div className="flex w-full flex-col gap-y-4 lg:max-w-[583px] lg:gap-y-12">
          <div className="font-outfit">
            <h2 className="py-1 text-2xl font-semibold sm:text-4xl">
              Set a New Password
            </h2>
            <p className="mt-2 text-base font-normal text-black/60 dark:text-neutral-400">
              Please enter and confirm your new password.
            </p>
          </div>

          <form
              noValidate
              className="flex flex-col gap-y-5 md:gap-y-10"
              onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-y-4">
              <InputText
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters long.",
                    },
                  })}
                  errorMsg={
                    errors.password?.message ? [errors.password.message] : undefined
                  }
                  label="New Password"
                  labelPlacement="outside"
                  name="password"
                  placeholder="Enter your new password"
                  size="lg"
                  typeName="password"
              />
              <InputText
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                        value === watch("password") || "Passwords do not match.",
                  })}
                  errorMsg={
                    errors.confirmPassword?.message
                        ? [errors.confirmPassword.message]
                        : undefined
                  }
                  label="Confirm New Password"
                  labelPlacement="outside"
                  name="confirmPassword"
                  placeholder="Confirm your new password"
                  size="lg"
                  typeName="password"
              />
            </div>

            <div className="flex flex-col gap-y-3 md:gap-y-2">
              <Button
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  title="Reset Password"
                  type="submit"
              />
            </div>
          </form>
        </div>

        <div className="relative hidden aspect-[1] max-h-[692px] w-full max-w-[790px] sm:block md:aspect-[1.14]">
          <Image
              fill
              priority
              alt="Reset Password Illustration"
              className={clsx(
                  "relative h-full w-full object-fill",
                  "transition duration-300 ease-in-out group-hover:scale-105"
              )}
              sizes={"(min-width: 768px) 66vw, 100vw"}
              src={FORGET_PASSWORD_IMG}
          />
        </div>
      </div>
  );
}