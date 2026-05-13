import LoadingDots from "@components/common/icons/LoadingDots";
import {MinusIcon, PlusIcon} from "@heroicons/react/24/outline";
import {throttle} from "@utils/helper";
import {useCart} from "@utils/hooks/useAddToCart";
import clsx from "clsx";
import {CartItem} from "@/types/api/trade/cart";
import {useAuthStatus} from "@utils/hooks/useAuthStatus";

function SubmitButton({
  type,
  handleUpdateCart,
  pending,
                        step = 1,
}: {
  type: "plus" | "minus";
  handleUpdateCart: (_: "plus" | "minus", step: number) => void;
  pending: boolean;
  step?: number;
}) {
  return (
    <button
      aria-disabled={pending}
      aria-label={
        type === "plus"
            ? `Increase item quantity by ${step}`
            : `Reduce item quantity by ${step}`
      }
      className={clsx(
          "ease flex h-full cursor-pointer flex-none items-center justify-center rounded-full px-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80",
        {
          "cursor-wait": pending,
          "min-w-[36px] max-w-[36px]": step === 1,
          "min-w-[40px] max-w-[40px] text-xs font-medium": step > 1,
        }
      )}
      type="button"
      onClick={() => handleUpdateCart(type, step)}
    >
      {pending ? (
        <LoadingDots className="bg-black dark:bg-white" />
      ) : type === "plus" ? (
          step === 1 ? (
              <PlusIcon className="h-4 w-4 dark:text-neutral-100"/>
          ) : (
              <span className="text-black dark:text-white">+{step}</span>
          )
      ) : (
          step === 1 ? (
              <MinusIcon className="h-4 w-4 dark:text-neutral-100"/>
          ) : (
              <span className="text-black dark:text-white">-{step}</span>
          )
      )}
    </button>
  );
}

export function EditItemQuantityButton({
  item,
  type,
                                         step = 1,
}: {
  item: CartItem;
  type: "plus" | "minus";
  step?: number;
}) {
  const {onUpdateItem, isUpdateLoading} = useCart();
  const {isGuest} = useAuthStatus();

  const handleUpdateCart = throttle((type: "plus" | "minus", step: number) => {
    if (isUpdateLoading) return;

    const newCount = type === "plus"
        ? item.count + step
        : Math.max(1, item.count - step);
    onUpdateItem(item, newCount, isGuest);
  }, 200);


  return (
    <SubmitButton
      handleUpdateCart={handleUpdateCart}
      pending={isUpdateLoading}
      type={type}
      step={step}
    />
  );
}