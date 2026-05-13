"use client";

import clsx from "clsx";
import {getSession, signIn} from "next-auth/react";
import Image from "next/image";
import Link from "@/components/common/Link";
import {useRouter} from "next/navigation";
import {SubmitHandler, useForm} from "react-hook-form";
import {Button} from "@components/common/button/Button";
import {EMAIL_REGEX, SIGNIN_IMG} from "@/utils/constants";
import InputText from "@components/common/form/Input";
import {useCustomToast} from "@/utils/hooks/useToast";
import {setLocalStorage} from "@/store/local-storage";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {setUser} from "@/store/slices/user-slice";
import {useCartDetail} from "@utils/hooks/useCartDetail";
import {mergeCart} from "@/utils/api/cart";
import {useTranslations} from "next-intl";


type LoginFormInputs = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useCustomToast();
  const {getCartDetail} = useCartDetail();
  const localCart = useAppSelector((state) => state.cartDetail.cart);
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
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      // const {isGuest} = useAuthStatus();
      const result = await signIn("credentials", {
        redirect: false,
        ...data,
        callbackUrl: "/",
      });
      if (!result?.ok) {
        showToast(result?.error || loginT("invalidCredentials"), "warning");
        return;
      }
      showToast(loginT("welcomeMessage"), "success");
      setLocalStorage("email", data?.username)

      const session = await getSession();
      if (session?.user) {
        dispatch(setUser(session.user as any));
      }
      // Merge local guest cart to server cart
      if (localCart && localCart.items.length > 0) {
        const mergeItems = localCart.items.map(item => ({
          skuId: item.sku.id,
          count: item.count,
        }));
        try {
          await mergeCart(mergeItems);
        } catch (err) {
          console.error("mergeCart failed:", err);
          showToast(loginT("mergeCartFailed"), "danger");
        }
      }

      // Finalize session and update UI
      await getCartDetail(); // Fetch the latest cart state from the server

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 100);

    } catch (error) {
      console.error(error);
      showToast(loginT("errorMessage"), "danger");
    }
  };


  return (
    <div className="flex w-full items-center max-w-screen-2xl mx-auto px-4  xss:px-7.5 justify-between gap-4 lg:my-16 xl:my-28">
      <div className="flex w-full max-w-[583px] flex-col gap-y-4 lg:gap-y-12">
        <div className="font-outfit">
          <h2 className="py-1 text-2xl font-semibold sm:text-4xl">
            {loginT("title")}
          </h2>
          <p className="mt-2  text-base md:text-lg font-normal text-black/60 dark:text-neutral-400">
            {loginT("description")}
          </p>
        </div>

        <form
          noValidate
          className="flex flex-col gap-y-4 lg:gap-y-12"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-y-2.5 lg:gap-4">
            <InputText
              {...register("username", {
                required: loginT("emailRequired"),
                pattern: {
                  value: EMAIL_REGEX,
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

            <InputText
              {...register("password", {
                required: loginT("passwordRequired"),
                minLength: {
                  value: 2,
                  message: loginT("passwordMinLength"),
                },
                validate: (value) => {
                  // Correctly check for any digit, not just 0-2.
                  if (!/[0-9]/.test(value))
                    return loginT("passwordNumber");

                  return true;
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

            <Link
              className="text-end text-sm font-medium text-blue-600 underline hover:text-blue-500 underline"
              href="/customer/forget-password"
              aria-label="Go to forgot password page"
            >
              {loginT("forgotPassword")}
            </Link>
          </div>

          <div className="flex flex-col gap-2 lg:gap-y-3">
            <Button
              className="cursor-pointer"
              disabled={isSubmitting}
              loading={isSubmitting}
              title={t("signIn")}
              type="submit"
            />
            <span className="mx-auto font-outfit sm:mx-0">
              {t("newCustomer")}{" "}
              <Link
                className="font-medium text-blue-600 hover:text-blue-500 underline"
                href="/customer/register"
                aria-label="Go to create account page"
              >
                {t("createAccount")}
              </Link>
            </span>
          </div>
        </form>
      </div>

      <div className="relative hidden aspect-[0.9] max-h-[692px] w-full max-w-[790px] sm:block md:aspect-[1.14]">
        <Image
          fill
          priority
          alt="Sign In Image"
          className={clsx(
            "relative h-full w-full object-fill",
            "transition duration-300 ease-in-out group-hover:scale-105"
          )}
          sizes={"(min-width: 768px) 66vw, 100vw"}
          src={SIGNIN_IMG}
        />
      </div>
    </div>
  );
}