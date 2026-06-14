"use client";
import clsx from "clsx";
import {useDisclosure} from "@heroui/react";
import {AnimatePresence, motion} from "framer-motion";
import {Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader,} from "@heroui/drawer";
import {ShoppingCartIcon} from "@heroicons/react/24/outline";
import {DEFAULT_OPTION} from "@/utils/constants";
import {useAppSelector} from "@/store/hooks";
import OpenCart from "./OpenCart";
import {Price} from "../theme/ui/Price";
import CloseCart from "../common/icons/cart/CloseCart";
import {DeleteItemButton} from "../common/icons/cart/DeleteItemButton";
import {EditItemQuantityButton} from "../common/icons/cart/EditItemQuantityButton";
import {useCartDetail} from "@utils/hooks/useCartDetail";
import Image from "next/image";
import {NOT_IMAGE} from "@utils/constants";
import Link from "@/components/common/Link";
import {useMediaQuery} from "@utils/hooks/useMediaQueryHook";
import {useBodyScrollLock} from "@utils/hooks/useBodyScrollLock";
import {useSyncExternalStore} from "react";
import {createUrl} from "@/utils/helper";
import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";

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
  const t = useTranslations("cart");
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
  const router = useRouter();
  const {isAuthenticated} = useAppSelector((state) => state.user);
  // const email = useAppSelector((state) => state.checkout.email);
  const cartDetail = useAppSelector((state) => state.cartDetail);
  const cart = Array.isArray(cartDetail?.cart?.items)
      ? cartDetail?.cart?.items
    : [];
  const grandTotal = cart.reduce((total: number, item: any) => {
    return total + item.count * item.sku.price;
  }, 0);
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
                    <p className="text-lg font-semibold">{t("title")}</p>
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
                        {t("empty")}
                      </p>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col justify-between overflow-hidden">
                      <ul className="my-0 flex-grow overflow-auto py-0">
                        {Array.isArray(cart) &&
                          cart?.map((item: any, i: number) => {
                            const merchandiseSearchParams =
                              {} as MerchandiseSearchParams;

                            item.sku.properties.forEach((property: any) => {
                              merchandiseSearchParams[property.name] = property.valueName;
                            })

                            const merchandiseUrl = createUrl(
                                `/product/${item?.spu.id}`,
                              new URLSearchParams(merchandiseSearchParams),
                            );
                            const baseImage: any = item.sku.picUrl;

                            return (
                              <li key={i} className="flex w-full flex-col">
                                <div className="flex w-full flex-row justify-between gap-2 md:gap-3 px-1 py-4">
                                  <Link
                                      className="z-30 flex flex-row space-x-2 md:space-x-4 min-w-0 flex-1"
                                    aria-label={`${item.spu.name}`}
                                    href={merchandiseUrl}
                                    onClick={finalOnClose}
                                  >
                                    <div
                                        className="relative h-12 w-12 md:h-16 md:w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                      <Image
                                        alt={
                                            item?.sku?.picUrl ||
                                            item?.spu?.name
                                        }
                                        className="h-full w-full object-cover"
                                        height={48}
                                        src={baseImage || NOT_IMAGE}
                                        width={48}
                                        onError={(e) =>
                                          (e.currentTarget.src = NOT_IMAGE)
                                        }
                                      />
                                    </div>

                                    <div className="flex flex-1 flex-col min-w-0 text-base">
                                      <span
                                          className="line-clamp-2 md:line-clamp-1 font-outfit text-sm md:text-base font-medium">
                                        {item?.spu?.name}
                                      </span>
                                      {item.name !== DEFAULT_OPTION && (
                                          <p className="text-xs md:text-sm lowercase line-clamp-1 text-neutral-500 dark:text-neutral-400 mt-0.5">
                                          {Object.values(merchandiseSearchParams).join(", ")}
                                        </p>
                                      )}
                                    </div>
                                  </Link>

                                  <div className="flex h-12 md:h-16 flex-col justify-between items-end min-w-[80px]">
                                    <Price
                                        amount={item?.sku?.price}
                                        className="flex justify-end text-right font-outfit text-sm md:text-base font-medium w-full"
                                      currencyCode={"USD"}
                                    />
                                    <div className="flex items-center gap-x-1.5 md:gap-x-2">
                                      <DeleteItemButton item={item} />
                                      <div
                                          className="flex h-7 md:h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                        {/* 移动端：只显示 - 和 + 按钮，减少宽度 */}
                                        <div className="hidden md:flex">
                                          <EditItemQuantityButton item={item} type="minus" step={10}/>
                                        </div>
                                        <EditItemQuantityButton item={item} type="minus"/>
                                        <p className="w-5 md:w-8 text-center">
                                          <span className="w-full text-xs md:text-sm font-medium">
                                            {item?.count}
                                          </span>
                                        </p>
                                        <EditItemQuantityButton item={item} type="plus"/>
                                        <div className="hidden md:flex">
                                          <EditItemQuantityButton item={item} type="plus" step={10}/>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                      </ul>

                      <div className="border-0 border-t border-solid border-neutral-200 dark:border-dark-grey py-4 text-sm text-neutral-500 dark:text-neutral-400">
                        <div className="mb-3 flex items-center justify-between pb-1">
                          <p className="text-base font-normal text-black/[60%] dark:text-white">
                            {t("total")}
                          </p>
                          <Price
                              amount={grandTotal}
                            className="text-right text-base font-medium text-black dark:text-white"
                            currencyCode={"USD"}
                          />
                        </div>
                      </div>

                      {isAuthenticated && (
                          <button
                              type="button"
                              className="block w-full rounded-full bg-green-600 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100 cursor-pointer"
                              onClick={() => {
                                finalOnClose?.();
                                router.push("/rfqs/create");
                              }}
                          >
                            {t("createRfq")}
                          </button>
                      )}
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
                      {t("title")}
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
                        {t("empty")}
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
                                `/product/${item?.spu.id}`,
                              new URLSearchParams(merchandiseSearchParams),
                            );
                            const baseImage: any = item?.sku?.picUrl;
                            return (
                              <li key={i} className="flex w-full flex-col">
                                <div className="flex w-full flex-row justify-between gap-2 md:gap-3 px-1 py-4">
                                  <Link
                                      className="z-30 flex flex-row space-x-2 md:space-x-4 min-w-0 flex-1"
                                    aria-label={`${item?.spu?.name}`}
                                    href={merchandiseUrl}
                                    onClick={finalOnClose}
                                  >
                                    <div
                                        className="relative h-12 w-12 md:h-16 md:w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                      <Image
                                        alt={
                                            item?.sku?.picUrl ||
                                            item?.spu?.name
                                        }
                                        className="h-full w-full object-cover"
                                        height={48}
                                        src={baseImage || NOT_IMAGE}
                                        width={48}
                                        onError={(e) =>
                                          (e.currentTarget.src = NOT_IMAGE)
                                        }
                                      />
                                    </div>
                                    <div className="flex flex-1 flex-col min-w-0 text-base">
                                      <span
                                          className="line-clamp-2 md:line-clamp-1 font-outfit text-sm md:text-base font-medium">
                                        {item?.spu?.name}
                                      </span>
                                      {item.spu.name !== DEFAULT_OPTION && (
                                          <p className="text-xs md:text-sm lowercase line-clamp-1 text-neutral-500 dark:text-neutral-400 mt-0.5">
                                            {item?.sku?.name || ""}
                                        </p>
                                      )}
                                    </div>
                                  </Link>
                                  <div className="flex h-12 md:h-16 flex-col justify-between items-end min-w-[80px]">
                                    <Price
                                        amount={item?.sku?.price}
                                        className="flex justify-end text-right font-outfit text-sm md:text-base font-medium w-full"
                                      currencyCode={"USD"}
                                    />
                                    <div className="flex items-center gap-x-1.5 md:gap-x-2">
                                      <DeleteItemButton item={item} />
                                      <div
                                          className="flex h-7 md:h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                        {/* 移动端：只显示 - 和 + 按钮，减少宽度 */}
                                        <div className="hidden md:flex">
                                          <EditItemQuantityButton item={item} type="minus" step={10}/>
                                        </div>
                                        <EditItemQuantityButton item={item} type="minus"/>
                                        <p className="w-5 md:w-8 text-center">
                                          <span className="w-full text-xs md:text-sm font-medium">
                                            {item?.count}
                                          </span>
                                        </p>
                                        <EditItemQuantityButton item={item} type="plus"/>
                                        <div className="hidden md:flex">
                                          <EditItemQuantityButton item={item} type="plus" step={10}/>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                      </ul>

                      <div className="border-0 border-t border-solid border-neutral-200 dark:border-dark-grey py-4 text-sm text-neutral-500 dark:text-neutral-400">
                        <div className="mb-3 flex items-center justify-between pb-1">
                          <p className="text-base font-normal text-black/[60%] dark:text-white">
                            {t("total")}
                          </p>
                          <Price
                              amount={String(grandTotal / 100)}
                            className="text-right text-base font-medium text-black dark:text-white"
                            currencyCode={"USD"}
                          />
                        </div>

                        {isAuthenticated && (
                            <button
                                type="button"
                                className="block w-full rounded-full bg-green-600 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100 cursor-pointer"
                                onClick={() => {
                                  finalOnClose?.();
                                  router.push("/rfqs/create");
                                }}
                            >
                              {t("createRfq")}
                            </button>
                        )}
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

