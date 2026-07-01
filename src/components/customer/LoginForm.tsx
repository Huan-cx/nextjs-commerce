"use client";

import {signIn, useSession} from "next-auth/react";
import Image from "next/image";
import Link from "@/components/common/Link";
import {SubmitHandler, useForm} from "react-hook-form";
import {Button} from "@components/common/button/Button";
import {SIGNIN_IMG} from "@/utils/constants";
import InputText from "@components/common/form/Input";
import {useCustomToast} from "@/utils/hooks/useToast";
import {useTranslations} from "next-intl";

type LoginFormInputs = {
  username: string;
  password: string;
};

/**
 * 登录表单 - NextAuth 官方标准实现
 *
 * 【最佳实践原则】：越简单的代码越不容易出 bug
 *
 * ❌ 不要做的事情：
 * - 不要手动跳转（router.push / window.location.href）
 * - 不要手动管理 session 状态
 * - 不要"先验证后跳转"的两步登录
 * - 不要任何花里胡哨的自定义逻辑
 *
 * ✅ NextAuth 标准流程：
 *   1. signIn({ redirect: true, callbackUrl: "/" })
 *   2. NextAuth 内部处理所有时序
 *   3. 登录成功 → 自动跳转到 callbackUrl
 *   4. 登录失败 → 停留在当前页，显示错误信息
 *
 * 这个流程经过了社区百万级项目的验证，是最可靠的方案。
 */
export default function LoginForm() {
  const {status} = useSession();
  const { showToast } = useCustomToast();
  const t = useTranslations("auth");
  const loginT = useTranslations("loginForm");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // ✅ 加载中不渲染
  if (status === "loading") {
    return null;
  }

  // ✅ 已登录就不渲染表单
  if (status === "authenticated") {
    return null;
  }

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      showToast(loginT("loggingIn"));

      // ✅ NextAuth 官方标准做法 - 仅此一行足矣！
      //
      // redirect: true 意味着：
      //   1. NextAuth 处理完整登录流程
      //   2. Cookie 写入完成后才跳转
      //   3. 目标页面 Session 100% 可用
      //   4. 失败时停留在当前页显示错误
      //
      // 这是经过百万级项目验证的最可靠方案
      await signIn("credentials", {
        redirect: true,
        username: data.username,
        password: data.password,
        callbackUrl: "/",
      });

      // 注意：signIn(redirect: true) 之后的代码不会执行（页面已跳转
      // 如果登录失败，NextAuth 会在 URL 带上 error 参数，由页面处理

    } catch (error) {
      console.error(error);
      showToast(loginT("errorMessage"), "danger");
    }
  };

  return (
      <div
          className="flex w-full items-center max-w-screen-2xl mx-auto px-4 xss:px-7.5 justify-between gap-4 lg:my-16 xl:my-28">
      <div className="flex w-full max-w-[583px] flex-col gap-y-4 lg:gap-y-12">
        <div className="font-outfit">
          <h2 className="py-1 text-2xl font-semibold sm:text-4xl">
            {loginT("title")}
          </h2>
          <p className="mt-2 text-base md:text-lg font-normal text-black/60 dark:text-neutral-400">
            {loginT("description")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <InputText
              {...register("username", {
                required: loginT("emailRequired"),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: loginT("emailInvalid"),
                },
              })}
              errorMsg={
                errors.username?.message ? [errors.username.message] : undefined
              }
              label={loginT("emailLabel")}
              labelPlacement="outside"
              name="username"
              placeholder={loginT("emailPlaceholder")}
              rounded="md"
              size="lg"
              typeName="email"
            />
          </div>

          <div>
            <InputText
              {...register("password", {
                required: loginT("passwordRequired"),
                minLength: {
                  value: 6,
                  message: loginT("passwordMinLength"),
                },
              })}
              errorMsg={
                errors.password?.message ? [errors.password.message] : undefined
              }
              label={loginT("passwordLabel")}
              labelPlacement="outside"
              name="password"
              placeholder={loginT("passwordPlaceholder")}
              rounded="md"
              size="lg"
              typeName="password"
            />
          </div>

          <div className="flex items-center justify-between">
            <Link
                href="/customer/reset-password"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {loginT("forgotPassword")}
            </Link>
          </div>

          <Button
              type="submit"
              disabled={isSubmitting}
              title={isSubmitting ? loginT("loggingIn") : loginT("submit")}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {t("noAccount")}{" "}
          <Link
              href="/customer/register"
              className="text-blue-600 hover:text-blue-500 font-medium dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t("register")}
          </Link>
        </p>
      </div>

        <div className="hidden lg:block w-1/2">
          <div className="relative w-full h-[600px]">
            <Image
                src={SIGNIN_IMG}
                alt="Login"
                fill
                className="object-cover rounded-2xl"
                priority
            />
          </div>
      </div>
    </div>
  );
}