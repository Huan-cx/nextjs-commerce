"use client";
import clsx from "clsx";
import { useDisclosure } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/drawer";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { DEFAULT_OPTION } from "@/utils/constants";
import { useAppSelector } from "@/store/hooks";
import OpenCart from "./OpenCart";
import { Price } from "../theme/ui/Price";
import CloseCart from "../common/icons/cart/CloseCart";
import { DeleteItemButton } from "../common/icons/cart/DeleteItemButton";
import { EditItemQuantityButton } from "../common/icons/cart/EditItemQuantityButton";
import { useCartDetail } from "@utils/hooks/useCartDetail";
import Image from "next/image";
import { NOT_IMAGE } from "@utils/constants";
import { isObject } from "@utils/type-guards";
import LoadingDots from "@components/common/icons/LoadingDots";
import { useFormStatus } from "react-dom";
import { redirectToCheckout } from "@/utils/actions";
import { EMAIL, getLocalStorage } from "@/store/local-storage";
import Link from "next/link";
import { createUrl, isCheckout, safeParse } from "@utils/helper";
import { useMediaQuery } from "@utils/hooks/useMediaQueryHook";
import { useBodyScrollLock } from "@utils/hooks/useBodyScrollLock";
import { useSyncExternalStore } from "react";
import { useAddressesFromApi } from "@utils/hooks/getAddress";

type MerchandiseSearchParams = {
  [key: string]: string;
};
export default function CartModal({
  children,
  className,
  onOpen,
  onClose,
  isOpen,
}: {
  children?: React.ReactNode;
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
}) {
  const {
    isOpen: internalIsOpen,
    onOpen: internalOnOpen,
    onClose: internalOnClose,
  } = useDisclosure();

  const isControlled = isOpen !== undefined;
  const finalIsOpen = isControlled ? isOpen : internalIsOpen;
  const finalOnOpen = isControlled ? onOpen : internalOnOpen;
  const finalOnClose = isControlled ? onClose : internalOnClose;

  const { isLoading } = useCartDetail();
  const cartDetail = useAppSelector((state) => state.cartDetail);
  const { billingAddress } = useAddressesFromApi(false);
  const cart = Array.isArray(cartDetail?.cart?.items?.edges)
    ? cartDetail?.cart?.items?.edges
    : [];
  const cartObj: any = cartDetail?.cart ?? {};
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const mounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false,
  );

  useBodyScrollLock(finalIsOpen && !isDesktop);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      finalOnClose?.();
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open cart"
        className={clsx(
          className,
          mounted && isLoading ? "cursor-wait" : "cursor-pointer",
        )}
        disabled={mounted ? isLoading : false}
        onClick={finalOnOpen}
      >
        {children ? (
          children
        ) : (
          <OpenCart quantity={cartDetail?.cart?.itemsQty} />
        )}
      </button>

      {isDesktop ? (
        <Drawer
          backdrop="blur"
          hideCloseButton={true}
          classNames={{ backdrop: "bg-white/50 dark:bg-black/50" }}
          isOpen={finalIsOpen}
          radius="none"
          onOpenChange={handleOpenChange}
        >
          <DrawerContent>
            {() => (
              <>
                <DrawerHeader className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">My Cart</p>
                    <button
                      aria-label="Close cart"
                      className="cursor-pointer"
                      onClick={finalOnClose}
                    >
                      <CloseCart />
                    </button>
                  </div>
                </DrawerHeader>

                <DrawerBody className="py-0">
                  {cart?.length === 0 ? (
                    <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                      <ShoppingCartIcon className="h-16" />
                      <p className="mt-6 text-center text-2xl font-bold">
                        Your cart is empty.
                      </p>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col justify-between overflow-hidden">
                      <ul className="my-0 flex-grow overflow-auto py-0">
                        {Array.isArray(cart) &&
                          cart?.map((item: any, i: number) => {
                            const merchandiseSearchParams =
                              {} as MerchandiseSearchParams;
                            const merchandiseUrl = createUrl(
                              `/product/${item?.node.productUrlKey}`,
                              new URLSearchParams(merchandiseSearchParams),
                            );
                            const baseImage: any = safeParse(
                              item?.node?.baseImage,
                            );

                            return (
                              <li key={i} className="flex w-full flex-col">
                                <div className="flex w-full flex-row justify-between gap-3 px-1 py-4">
                                  <Link
                                    className="z-30 flex flex-row space-x-4"
                                    aria-label={`${item?.node?.name}`}
                                    href={merchandiseUrl}
                                    onClick={finalOnClose}
                                  >
                                    <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                      <Image
                                        alt={
                                          item?.node?.baseImage ||
                                          item?.product?.name
                                        }
                                        className="h-full w-full object-cover"
                                        height={64}
                                        src={baseImage?.small_image_url || ""}
                                        width={74}
                                        onError={(e) =>
                                          (e.currentTarget.src = NOT_IMAGE)
                                        }
                                      />
                                    </div>

                                    <div className="flex flex-1 flex-col text-base">
                                      <span className="line-clamp-1 font-outfit text-base font-medium">
                                        {item?.node?.name}
                                      </span>
                                      {item.name !== DEFAULT_OPTION && (
                                        <p className="text-sm lowercase line-clamp-1 text-black dark:text-neutral-400">
                                          {item?.node?.sku}
                                        </p>
                                      )}
                                    </div>
                                  </Link>

                                  <div className="flex h-16 flex-col justify-between">
                                    <Price
                                      amount={item?.node?.price}
                                      className="flex justify-end space-y-2 text-right font-outfit text-base font-medium"
                                      currencyCode={"USD"}
                                    />
                                    <div className="flex items-center gap-x-2">
                                      <DeleteItemButton item={item} />
                                      <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                        <EditItemQuantityButton
                                          item={item}
                                          type="minus"
                                        />
                                        <p className="w-6 text-center">
                                          <span className="w-full text-sm">
                                            {item?.node?.quantity}
                                          </span>
                                        </p>
                                        <EditItemQuantityButton
                                          item={item}
                                          type="plus"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                      </ul>

                      <div className="border-0 border-t border-solid border-neutral-200 dark:border-dark-grey py-4 text-sm text-neutral-500 dark:text-neutral-400">
                        {(cartDetail as any)?.cart?.taxAmount > 0 && (
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-base font-normal text-black/[60%] dark:text-white">
                              Taxes
                            </p>
                            <Price
                              amount={(cartDetail as any)?.cart?.taxAmount}
                              className="text-right text-base font-medium text-black dark:text-white"
                              currencyCode={"USD"}
                            />
                          </div>
                        )}
                        <div className="mb-3 flex items-center justify-between pb-1">
                          <p className="text-base font-normal text-black/[60%] dark:text-white">
                            Total
                          </p>
                          <Price
                            amount={(cartDetail as any)?.cart?.grandTotal}
                            className="text-right text-base font-medium text-black dark:text-white"
                            currencyCode={"USD"}
                          />
                        </div>
                      </div>

                      <form action={redirectToCheckout}>
                        <CheckoutButton
                          cartDetails={cartObj?.items?.edges ?? []}
                          isGuest={cartObj?.isGuest}
                          isEmail={
                            cartObj?.customerEmail ?? getLocalStorage(EMAIL)
                          }
                          isSelectShipping={
                            cartObj?.selectedShippingRate != null
                          }
                          isSeclectAddress={isObject(billingAddress)}
                          isSelectPayment={cartObj?.paymentMethod != null}
                        />
                      </form>
                    </div>
                  )}
                </DrawerBody>

                <DrawerFooter className="flex flex-col gap-1" />
              </>
            )}
          </DrawerContent>
        </Drawer>
      ) : (
        <AnimatePresence>
          {finalIsOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={finalOnClose}
                className="fixed inset-0 z-40 bg-transparent lg:hidden transition-opacity"
                style={{ top: "68px", bottom: "64px" }}
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  mass: 0.8,
                }}
                className="fixed right-0 z-50 flex flex-col bg-white dark:bg-black w-full max-w-[448px] border-l border-neutral-200 dark:border-neutral-800 lg:hidden"
                style={{
                  top: "68px",
                  bottom: "64px",
                  width: "100%",
                  maxWidth: "448px",
                  height: "calc(var(--visual-viewport-height) - 132px)",
                }}
              >
                <div className="flex flex-col gap-1 p-4">
                  <div className="flex items-center justify-between">
                    <p
                      className={clsx(
                        "font-semibold",
                        isDesktop ? "text-lg" : "text-xl",
                      )}
                    >
                      My Cart
                    </p>
                    {isDesktop && (
                      <button
                        aria-label="Close cart"
                        className="cursor-pointer"
                        onClick={finalOnClose}
                      >
                        <CloseCart />
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className={clsx(
                    "flex-1 overflow-y-auto px-4 py-0 drawer-scrollbar-hidden",
                    !isDesktop && "!px-2",
                  )}
                >
                  {cart?.length === 0 ? (
                    <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                      <ShoppingCartIcon className="h-16" />
                      <p className="mt-6 text-center text-2xl font-bold">
                        Your cart is empty.
                      </p>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col justify-between">
                      <ul className="my-0 flex-grow overflow-auto py-0">
                        {Array.isArray(cart) &&
                          cart?.map((item: any, i: number) => {
                            const merchandiseSearchParams =
                              {} as MerchandiseSearchParams;
                            const merchandiseUrl = createUrl(
                              `/product/${item?.node.productUrlKey}`,
                              new URLSearchParams(merchandiseSearchParams),
                            );
                            const baseImage: any = safeParse(
                              item?.node?.baseImage,
                            );

                            return (
                              <li key={i} className="flex w-full flex-col">
                                <div
                                  className={clsx(
                                    "flex w-full flex-row justify-between py-4 px-1",
                                    isDesktop ? "gap-3" : "gap-1 xxs:gap-3",
                                  )}
                                >
                                  <Link
                                    className="z-30 flex flex-row space-x-4"
                                    aria-label={`${item?.node?.name}`}
                                    href={merchandiseUrl}
                                    onClick={finalOnClose}
                                  >
                                    <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                      <Image
                                        alt={
                                          item?.node?.baseImage ||
                                          item?.product?.name
                                        }
                                        className="h-full w-full object-cover"
                                        height={64}
                                        src={baseImage?.small_image_url || ""}
                                        width={74}
                                        onError={(e) =>
                                          (e.currentTarget.src = NOT_IMAGE)
                                        }
                                      />
                                    </div>
                                    <div className="flex flex-1 flex-col text-base">
                                      <span className="line-clamp-1 font-outfit text-base font-medium">
                                        {item?.node?.name}
                                      </span>
                                      {item.name !== DEFAULT_OPTION && (
                                        <p className="text-sm lowercase line-clamp-1 text-black dark:text-neutral-400">
                                          {item?.node?.sku}
                                        </p>
                                      )}
                                    </div>
                                  </Link>
                                  <div className="flex h-16 flex-col justify-between">
                                    <Price
                                      amount={item?.node?.price}
                                      className="flex justify-end space-y-2 text-right font-outfit text-base font-medium"
                                      currencyCode={"USD"}
                                    />
                                    <div className="flex items-center gap-x-2">
                                      <DeleteItemButton item={item} />
                                      <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                        <EditItemQuantityButton
                                          item={item}
                                          type="minus"
                                        />
                                        <p className="w-6 text-center">
                                          <span className="w-full text-sm">
                                            {item?.node?.quantity}
                                          </span>
                                        </p>
                                        <EditItemQuantityButton
                                          item={item}
                                          type="plus"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                      </ul>

                      <div className="border-0 border-t border-solid border-neutral-200 dark:border-dark-grey py-4 text-sm text-neutral-500 dark:text-neutral-400">
                        {(cartDetail as any)?.cart?.taxAmount > 0 && (
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-base font-normal text-black/[60%] dark:text-white">
                              Taxes
                            </p>
                            <Price
                              amount={(cartDetail as any)?.cart?.taxAmount}
                              className="text-right text-base font-medium text-black dark:text-white"
                              currencyCode={"USD"}
                            />
                          </div>
                        )}
                        <div className="mb-3 flex items-center justify-between pb-1">
                          <p className="text-base font-normal text-black/[60%] dark:text-white">
                            Total
                          </p>
                          <Price
                            amount={(cartDetail as any)?.cart?.grandTotal}
                            className="text-right text-base font-medium text-black dark:text-white"
                            currencyCode={"USD"}
                          />
                        </div>

                        <form action={redirectToCheckout}>
                          <CheckoutButton
                            cartDetails={cartObj?.items?.edges ?? []}
                            isGuest={cartObj?.isGuest}
                            isEmail={
                              cartObj?.customerEmail ?? getLocalStorage(EMAIL)
                            }
                            isSelectShipping={
                              cartObj?.selectedShippingRate != null
                            }
                            isSeclectAddress={isObject(billingAddress)}
                            isSelectPayment={cartObj?.paymentMethod != null}
                          />
                        </form>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </>
  );
}

function CheckoutButton({
  cartDetails,
  isGuest,
  isEmail,
  isSeclectAddress,
  isSelectShipping,
  isSelectPayment,
}: {
  cartDetails: Array<any>;
  isGuest: boolean;
  isEmail: string;
  isSeclectAddress: boolean;
  isSelectShipping: boolean;
  isSelectPayment: boolean;
}) {
  const { pending } = useFormStatus();
  const email = isEmail;

  return (
    <>
      <input
        name="url"
        type="hidden"
        value={isCheckout(
          cartDetails,
          isGuest,
          email,
          isSeclectAddress,
          isSelectShipping,
          isSelectPayment,
        )}
      />
      <button
        className={clsx(
          "block w-full rounded-full bg-blue-600 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100",
          pending ? "cursor-wait" : "cursor-pointer",
        )}
        disabled={pending}
        type="submit"
      >
        {pending ? <LoadingDots className="bg-white" /> : "Proceed to Checkout"}
      </button>
    </>
  );
}
