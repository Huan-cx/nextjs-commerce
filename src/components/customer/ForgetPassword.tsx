"use client";
import {useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import {Button} from "@components/common/button/Button";
import {EMAIL_REGEX, FORGET_PASSWORD_IMG} from '@/utils/constants';
import InputText from '@components/common/form/Input';
import {useCustomToast} from '@/utils/hooks/useToast';
import {sendResetPasswordMail} from "@utils/api/member";

type ForgetPasswordInputs = {
  email: string;
};

export default function ForgetPasswordForm() {
  const { showToast } = useCustomToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgetPasswordInputs>({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit: SubmitHandler<ForgetPasswordInputs> = async (data) => {
    setLoading(true);
    try {
      await sendResetPasswordMail({
        email: data.email,
      }).then(() => {
        showToast(
            "Reset password email sent. Please check your inbox.",
            "success"
        );
      })
          .catch(() => {
            showToast("Failed to send email.", "danger");
          });
    } catch (error) {
      showToast(
          error instanceof Error ? error.message : "An unknown error occurred.",
          "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-8 flex w-full items-center w-full max-w-screen-2xl mx-auto px-4 xss:px-7.5 justify-between gap-4 lg:my-16 xl:my-32">
      <div className="flex w-full flex-col gap-y-4 lg:max-w-[583px] lg:gap-y-12">
        <div className="font-outfit">
          <h2 className="py-1 text-2xl font-semibold sm:text-4xl">
            Recover Password
          </h2>
          <p className="mt-2 text-base md:text-lg font-normal text-black/60 dark:text-neutral-400">
            If you forgot your password, recover it by entering your email
            address.
          </p>
        </div>

        <form
          noValidate
          className="flex flex-col gap-y-5 md:gap-y-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <InputText
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: EMAIL_REGEX,
                message: "Please enter a valid email address.",
              },
            })}
            errorMsg={errors?.email?.message ? [errors.email.message] : undefined}
            label="Enter Your Email Address"
            labelPlacement="outside"
            name="email"
            placeholder="Enter email address"
            size="lg"
            typeName="email"
          />

          <div className="flex flex-col gap-y-3 md:gap-y-2">
            <Button
              disabled={loading || isSubmitting}
              loading={loading || isSubmitting}
              title="Reset Password"
              type="submit"
            />
            <span className="px-1 mx-auto md:mx-0 font-outfit">
              Back to sign in?{" "}
              <Link className="text-blue-600 underline" href="/customer/login" aria-label="Go to sign in page">
                Sign In
              </Link>
            </span>
          </div>
        </form>
      </div>

      <div className="relative hidden aspect-[1] max-h-[692px] w-full max-w-[790px] sm:block md:aspect-[1.14]">
        <Image
          fill
          priority
          alt="Forget Password Illustration"
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