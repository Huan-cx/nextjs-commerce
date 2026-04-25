"use client";

import {Popover, PopoverContent, PopoverTrigger} from "@heroui/popover";
import {Divider, Listbox, ListboxItem, useDisclosure} from "@heroui/react";
import {AnimatePresence, motion} from "framer-motion";
import clsx from "clsx";
import {signOut} from "next-auth/react";
import Link from "next/link";
import {Avatar} from "@heroui/avatar";
import {useForm} from "react-hook-form";
import {usePathname, useRouter} from "next/navigation";
import {useCustomToast} from '@/utils/hooks/useToast';
import {useMediaQuery} from "@utils/hooks/useMediaQueryHook";
import {useBodyScrollLock} from "@utils/hooks/useBodyScrollLock";
import OpenAuth from "../OpenAuth";
import {isObject} from '@/utils/type-guards';
import {logout} from "@utils/api/member";
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {clearUser} from "@/store/slices/user-slice";
import {clearCart} from "@/store/slices/cart-slice";
import {resetCheckoutState} from "@/store/slices/checkout-slice";
import LoadingDots from "@components/common/icons/LoadingDots";
import {ChevronRightIcon} from "@heroicons/react/24/outline";


export default function CredentialModal({
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
    onOpenChange: _internalOnOpenChange,
  } = useDisclosure();

  const isControlled = isOpen !== undefined;
  const finalIsOpen = isControlled ? isOpen : internalIsOpen;
  const finalOnOpen = isControlled ? onOpen : internalOnOpen;
  const finalOnClose = isControlled ? onClose : internalOnClose;

  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useCustomToast();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useBodyScrollLock(finalIsOpen && !isDesktop);

  const finalOnOpenChange = (open: boolean) => {
    if (isControlled) {
      if (open) onOpen?.();
      else onClose?.();
    } else {
      if (open) internalOnOpen();
      else internalOnClose();
    }
  };

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const { user } = useAppSelector((state) => state.user);
  const session = { user };
  const onSubmit = async () => {
    try {
      // Call the backend API to invalidate the token
      await logout();

      // Sign out from the frontend session
      await signOut({
        callbackUrl: "/customer/login",
        redirect: false,
      });
      dispatch(clearUser());
      dispatch(clearCart());
      dispatch(resetCheckoutState());

      showToast("You are logged out successfully!", "success");

      // Redirect to login page
      setTimeout(() => {
        router.push("/customer/login");
        router.refresh();
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Logout failed. Please try again.";
      showToast(message, "danger");
    }
  };
  const menuItems = [
    {
      key: "/account/profile",
      label: "Profile",
    },
    {
      key: "/account/orders",
      label: "Orders",
    },
    // {
    //   key: "logout",
    //   label: "Logout",
    // },
  ];
  const innerContent = (_onClose?: () => void) => (
    <div className={clsx("flex w-full flex-col rounded-md py-4", {
      "gap-y-6": !!session?.user || (!session?.user && isDesktop),
      "gap-y-10": !session?.user && !isDesktop,
    })}>
      {isObject(session?.user) ? (
        <>
          <header>
            <div className={clsx("flex flex-col gap-3", !isDesktop && "items-center justify-center")}>
              <div className={clsx("flex gap-3", !isDesktop ? "flex-col items-center" : "items-center")}>
                <Avatar
                  isBordered
                  showFallback
                  color="default"
                  icon={<OpenAuth className={clsx(isDesktop ? "h-8" : "h-12 w-12")} />}
                  size={isDesktop ? "md" : "lg"}
                  className={clsx(!isDesktop && "h-24 w-24 text-large")}
                />
                <div className={clsx("flex flex-col justify-center", !isDesktop ? "items-center gap-1" : "items-start")}>
                  <h4 className={clsx("leading-none dark:text-white", isDesktop ? "font-semibold text-default-500 text-small" : "text-xl font-bold text-black")}>
                    {session?.user?.nickname}
                  </h4>
                  <h5 className={clsx("tracking-tight dark:text-white", isDesktop ? "font-semibold text-default-500 text-small" : "text-sm text-gray-500")}>
                    {session?.user?.email}
                  </h5>
                </div>
              </div>

              <p className={clsx("text-default-500 dark:text-white", isDesktop ? "text-small pl-px" : "text-center mt-2")}>
                Manage Cart, Orders
                <span aria-label="confetti" className="px-2" role="img">
                  🎉
                </span>
              </p>
            </div>
          </header>

          <Divider className="opacity-50"/>


          <nav className="w-full">
            <Listbox
                aria-label="User Menu"
                onAction={(key) => {
                  console.log(key);
                  router.push(typeof key === "string" ? key : key.toString());
                  finalOnClose?.();
                }}
                variant="flat"
                className="p-0" // 移除 Listbox 自身的内边距
                itemClasses={{
                  base: [
                    "rounded-none",      // 核心：移除圆角，实现背景全宽
                    "px-4",              // 左右内边距，保持文字对齐
                    "py-3",              // 垂直高度
                    "gap-0",
                    "data-[hover=true]:bg-default-100", // 图片中的灰色背景色
                    "data-[hover=true]:text-default-900",
                  ],
                  title: "text-sm font-medium",
                }}
            >
              {menuItems.map((item) => (
                  <ListboxItem
                      key={item.key}
                      aria-label="User Menu"
                      variant="flat"
                      // 关键：去掉 Listbox 默认的包裹间距，让内容撑满
                      className={clsx(item.key === "logout" && "text-danger")}
                      textValue={item.label}
                      endContent={<ChevronRightIcon/>}
                  >
                    <span className={clsx(isDesktop ? "text-base" : "text-base")}>
                      {item.label}
                    </span>
                  </ListboxItem>
              ))}
            </Listbox>
          </nav>
          <footer>
            <form onSubmit={handleSubmit(onSubmit)} className={clsx(!isDesktop && "flex justify-center")}>
              <button
                className={clsx(
                  "rounded-full bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700",
                  isSubmitting ? " cursor-not-allowed" : " cursor-pointer",
                  isDesktop ? "w-full" : "w-40 min-w-[150px] mt-2"
                )}
                type="submit"
              >
                <div className="mx-1">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <p>Loading</p>
                      <LoadingDots className="bg-white" />
                    </div>
                  ) : (
                    <p> Log Out</p>
                  )}
                </div>
              </button>
            </form>
          </footer>
        </>
      ) : (
        <>
          <header className={clsx({ "text-center": !isDesktop })}>
            <div className="flex flex-col gap-y-2">
              <h4 className={clsx("font-bold leading-none text-black dark:text-white",
                isDesktop ? "text-xl" : "text-3xl")}>
                Welcome Guest
              </h4>
              <p className={clsx("text-default-500 dark:text-neutral-400",
                isDesktop ? "text-sm" : "text-lg")}>
                Manage Cart, Orders
                <span aria-label="confetti" className="px-2" role="img">
                  🎉
                </span>
              </p>
            </div>
          </header>

          <footer className="flex gap-4">
            <Link className="w-full" href="/customer/login" onClick={finalOnClose} aria-label="Go to sign in page">
              <button
                className={clsx(
                  "w-full rounded-full bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800",
                  pathname === "/customer/login"
                    ? " cursor-not-allowed"
                    : " cursor-pointer"
                )}
                disabled={pathname === "/customer/login"}
                type="button"
              >
                Sign In
              </button>
            </Link>

            <Link className="w-full" href="/customer/register" onClick={finalOnClose} aria-label="Go to create account page">
              <button
                className={clsx(
                  "w-full rounded-full bg-[#1e293b] px-5 py-3 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700",
                  pathname === "/customer/register"
                    ? " cursor-not-allowed"
                    : " cursor-pointer"
                )}
                disabled={pathname === "/customer/register"}
                type="button"
              >
                Sign Up
              </button>
            </Link>
          </footer>
        </>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <Popover
        backdrop="opaque"
        isOpen={finalIsOpen}
        onOpenChange={finalOnOpenChange}
        defaultOpen={false}
        color="default"
        placement="bottom-end"
      >
        <PopoverTrigger>
          <button
            type="button"
            aria-label="Open account"
            className={clsx(className, "cursor-pointer bg-transparent")}
          >
            {children ? children : <OpenAuth />}
          </button>
        </PopoverTrigger>
        <PopoverContent className="min-w-[300px] px-4">
          {innerContent(finalOnClose)}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open account"
        className={clsx(className, "cursor-pointer bg-transparent")}
        onClick={finalOnOpen}
      >
        {children ? children : <OpenAuth />}
      </button>

      <AnimatePresence>
        {finalIsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={finalOnClose}
              className="fixed inset-0 z-40 bg-transparent lg:hidden"
              style={{ top: "68px", bottom: "64px" }}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed right-0 z-50 flex flex-col border-l border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black lg:hidden"
              style={{
                top: "68px",
                bottom: "64px",
                width: "100%",
                maxWidth: "448px",
                height: "calc(var(--visual-viewport-height) - 132px)",
              }}
            >
              <div className="flex flex-col gap-1 border-b border-neutral-100 p-4 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <p className="text-xl font-semibold dark:text-white">Account</p>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-center px-4 py-0 drawer-scrollbar-hidden">
                {innerContent(finalOnClose)}
              </div>

              <div className="p-4" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}