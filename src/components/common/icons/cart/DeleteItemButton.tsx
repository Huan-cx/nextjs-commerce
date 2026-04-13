import LoadingDots from "@components/common/icons/LoadingDots";
import {TrashIcon} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {CartItem} from "@/types/api/trade/cart";
import {useCart} from "@utils/hooks/useAddToCart";


function SubmitButton({
  loading,
  handleRemoveCart,
}: {
  loading: boolean;
  handleRemoveCart: () => void;
}) {
  return (
    <button
      aria-disabled={loading}
      aria-label="Remove cart item"
      className={clsx(
        "ease flex h-[17px] w-[17px] cursor-pointer items-center justify-center rounded-full  transition-all duration-200",
        {
          "cursor-wait px-0": loading,
        }
      )}
      type="button"
      onClick={handleRemoveCart}
    >
      {loading ? (
        <LoadingDots className="bg-black dark:bg-white" />
      ) : (
        <TrashIcon className="hover:text-accent-3 mx-[1px] h-6 w-6" />
      )}
    </button>
  );
}

export function DeleteItemButton({item}: { item: CartItem }) {
  const {onRemoveItem, isRemoveLoading} = useCart();
  const itemId = item?.id;
  const handleRemoveCart = () => {
    onRemoveItem(itemId);
  };

  return (
    <SubmitButton
      handleRemoveCart={handleRemoveCart}
      loading={isRemoveLoading}
    />
  );
}
