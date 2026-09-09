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
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useRef} from "react";
import {trackEvent} from "@/lib/analytics";

type LoginFormInputs = {
  username: string;
  password: string;
};

/**
 * 登录表单 - NextAuth 异步登录实现
 *
 * ✅ 使用 signIn({ redirect: false }) 异步模式：
 *   1. signIn 返回 { ok, error, url }，前端完全可控
 *   2. 登录成功 → router.push 跳转到 callbackUrl
 *   3. 登录失败 → 不跳转，停留在当前页，弹出 toast 错误提示
 *
 * 【为什么不用 redirect: true】
 *   redirect: true 是整页跳转模式，登录失败时浏览器会直接跳到
 *   pages.error 页面，前端 catch 块无法执行，也就无法弹出 toast。
 */
export default function LoginForm() {
  const {status} = useSession();
  const { showToast } = useCustomToast();
  const t = useTranslations("auth");
  const loginT = useTranslations("loginForm");
  const searchParams = useSearchParams();
  const router = useRouter();
  // 标记：用户是否主动发起了登录（防止已登录用户访问登录页时触发伪造事件）
  const loginInProgress = useRef(false);
  const loginTracked = useRef(false);

  // ✅ 监听登录成功状态变化，触发 login 事件
  // 仅在 loginInProgress=true（用户主动操作）且未重复触发时才发送
  useEffect(() => {
    if (
        status === "authenticated" &&
        loginInProgress.current &&
        !loginTracked.current
    ) {
      loginTracked.current = true;
      trackEvent("login", {method: "email"});
    }
  }, [status]);

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

      // ✅ 标记用户主动发起登录，用于后续触发 analytics 事件
      loginInProgress.current = true;

      // ✅ redirect: false 异步模式：
      //   - 登录失败 → 返回 { ok: false, error }，不跳转，直接弹 toast
      //   - 登录成功 → 返回 { ok: true, url }，手动跳转到 callbackUrl
      const rawCallbackUrl = searchParams.get("callbackUrl") || "/";
      const callbackUrl = /\/customer\/(login|register|forget-password|reset-password)/.test(rawCallbackUrl)
          ? "/"
          : rawCallbackUrl;
      const result = await signIn("credentials", {
        redirect: false,
        username: data.username,
        password: data.password,
        callbackUrl,
      });
      if (result?.error) {
        // 登录失败：停留在当前页，弹出错误提示
        loginInProgress.current = false;
        showToast(result.error, "danger");
        return;
      }

      // 登录成功：手动跳转（此时 session cookie 已由 NextAuth 写入）
      router.push(result?.url || callbackUrl);
    } catch (error) {
      // 网络异常等意外情况
      loginInProgress.current = false;
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

        {/* eslint-disable-next-line react-hooks/refs -- onSubmit 是事件处理函数，不会在 render 中执行 */}
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