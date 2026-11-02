"use client";
import LoadingDots from "@components/common/icons/LoadingDots";
import clsx from "clsx";

function SubmitButton({
  availableForSale,
  buttonName,
  className,
  pending,
                        isDisabled,
}: {
  availableForSale: boolean;
  buttonName: string;
  className?: string;
  pending: boolean;
  isDisabled: boolean;
}) {
  const buttonClasses =
    "relative text-base w-fit cursor-pointer rounded-full px-8 py-3 font-bold border-white items-center justify-center bg-blue-600 tracking-wide text-white";
  const disabledClasses = "cursor-wait opacity-60 hover:opacity-60";
  const formInvalidClasses = "cursor-not-allowed opacity-60 hover:opacity-60";

  // 如果表单无效（isDisabled=true），显示按钮名称但禁用
  if (isDisabled) {
    return (
        <button
            type="button"
            aria-disabled
            disabled
            className={clsx(buttonClasses, formInvalidClasses, className)}
        >
          {buttonName}
        </button>
    );
  }

  if (!availableForSale) {
    return (
      <button 
        type="button"
        aria-disabled 
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        Processing...
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      aria-label="Proceed to checkout"
      className={clsx(
        buttonClasses,
        {
          "hover:opacity-90": !pending,
          [disabledClasses]: pending,
        },
        className,
      )}
    >
      <div className="absolute left-0 ml-4">
        {pending && <LoadingDots className="mb-3 bg-white" />}
      </div>
      {buttonName}
    </button>
  );
}

export function ProceedToCheckout({
  buttonName,
  className,
  pending = false,
                                    isDisabled = false,
}: {
  buttonName: string;
  className?: string;
  pending: boolean;
  isDisabled?: boolean;
}) {
  return (
    <SubmitButton
      availableForSale={!pending}
      buttonName={buttonName}
      className={className}
      pending={pending}
      isDisabled={isDisabled}
    />
  );
}