"use client";

import {Popover, PopoverContent, PopoverTrigger} from "@heroui/popover";
import {Divider, Listbox, ListboxItem, useDisclosure} from "@heroui/react";
import {AnimatePresence, motion} from "framer-motion";
import clsx from "clsx";
import {signOut} from "next-auth/react";
import Link from "@/components/common/Link";
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
import {FileText, MapPin, Package, User} from "lucide-react";
import {useTranslations} from "next-intl";

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

  // 【关键修复】从 Redux 读取完整状态，包含 isSessionLoading
  // loading 时不要显示"未登录"UI，显示 spinner 避免闪烁
  const {user, isAuthenticated, isSessionLoading} = useAppSelector((state) => state.user);
  const t = useTranslations("header");
  const modalT = useTranslations("credentialModal");

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

      showToast(modalT("logoutSuccess"), "success");

      // Redirect to login page
      setTimeout(() => {
        router.push("/customer/login");
        router.refresh();
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : modalT("logoutFailed");
      showToast(message, "danger");
    }
  };

  // ✅ 统一菜单选项：与 AccountSidebar 完全一致，确保导航完整性
  // 注意：路径与 AccountSidebar 中的路由 key 对应 (/account/{key})
  const menuItems = [
    {
      key: "/account/profile",
      label: t("profile"),
      icon: <User size={18} className="text-default-400"/>,
    },
    {
      key: "/account/address",
      label: t("address"),
      icon: <MapPin size={18} className="text-default-400"/>,
    },
    {
      key: "/account/b2b-rfq",
      label: t("b2bRfq"),
      icon: <FileText size={18} className="text-default-400"/>,
    },
    {
      key: "/account/orders",
      label: t("orders"),
      icon: <Package size={18} className="text-default-400"/>,
    },
  ];

  // 渲染内容（考虑 loading 状态）
  const innerContent = (_onClose?: () => void) => (
    <div className={clsx("flex w-full flex-col rounded-md py-4", {
      "gap-y-6": isAuthenticated || (!isAuthenticated && isDesktop),
      "gap-y-10": !isAuthenticated && !isDesktop,
    })}>
      {/* Loading 状态：显示 spinner，避免闪烁 */}
      {isSessionLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <LoadingDots className="bg-foreground"/>
            <p className="mt-2 text-sm text-default-500">{modalT("loadingSession")}</p>
          </div>
      ) : isAuthenticated && isObject(user) ? (
        <>
          {/* 用户信息头部 - 统一设计风格 */}
          <header>
            <div className={clsx("flex flex-col gap-3", !isDesktop && "items-center justify-center")}>
              <div className={clsx("flex gap-3", !isDesktop ? "flex-col items-center" : "items-center")}>
                <Avatar
                  isBordered
                  showFallback
                  color="primary"
                  radius="full"
                  size={isDesktop ? "md" : "lg"}
                  src={(user as any)?.avatar}
                  className={clsx(!isDesktop && "h-24 w-24 text-large")}
                  fallback={<User size={isDesktop ? 24 : 36}/>}
                />
                <div className={clsx("flex flex-col justify-center", !isDesktop ? "items-center gap-1" : "items-start")}>
                  <h4 className={clsx("leading-none dark:text-white font-bold text-default-900", isDesktop ? "text-base" : "text-xl")}>
                    {(user as any)?.nickname}
                  </h4>
                  <h5 className={clsx("tracking-tight text-sm text-default-500")}>
                    {(user as any)?.email}
                  </h5>
                </div>
              </div>

              <p className={clsx("text-default-500 dark:text-white", isDesktop ? "text-small pl-px" : "text-center mt-2")}>
                {modalT("manageCartOrders")}
                <span aria-label="confetti" className="px-2" role="img">
                  🎉
                </span>
              </p>
            </div>
          </header>

          <Divider className="opacity-50"/>

          {/* 导航菜单 - 与 AccountSidebar 样式统一 */}
          <nav className="w-full">
            <Listbox
                aria-label="User Menu"
                onAction={(key) => {
                  router.push(typeof key === "string" ? key : key.toString());
                  finalOnClose?.();
                }}
                variant="flat"
                className="p-0"
                itemClasses={{
                  base: [
                    "rounded-lg",
                    "mx-2",
                    "my-0.5",
                    "px-3",
                    "py-2.5",
                    "gap-3",
                    "data-[hover=true]:bg-default-100/60",
                    "data-[hover=true]:text-default-900",
                    "transition-colors duration-150",
                  ],
                  title: "text-sm font-semibold",
                  wrapper: "w-full",
                }}
            >
              {menuItems.map((item) => (
                  <ListboxItem
                      key={item.key}
                      aria-label="User Menu"
                      variant="flat"
                      textValue={item.label}
                      startContent={item.icon}
                      endContent={<ChevronRightIcon className="w-4 h-4 text-default-400"/>}
                  >
                    <span className="text-sm font-medium text-default-700">
                      {item.label}
                    </span>
                  </ListboxItem>
              ))}
            </Listbox>
          </nav>

          <Divider className="opacity-50 my-2"/>

          {/* 退出登录按钮 - 样式优化 */}
          <footer className="px-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <button
                  className={clsx(
                      "w-full rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-150",
                      "bg-danger/10 text-danger hover:bg-danger/20 active:bg-danger/30",
                      isSubmitting ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                  )}
                  type="submit"
              >
                <div className="flex items-center justify-center gap-2">
                  {isSubmitting ? (
                      <>
                        <span>{modalT("loading")}</span>
                        <LoadingDots className="bg-danger"/>
                      </>
                  ) : (
                      <span>{modalT("logOut")}</span>
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
                {modalT("welcomeGuest")}
              </h4>
              <p className={clsx("text-default-500 dark:text-neutral-400",
                isDesktop ? "text-sm" : "text-lg")}>
                {modalT("manageCartOrders")}
                <span aria-label="confetti" className="px-2" role="img">
                  🎉
                </span>
              </p>
            </div>
          </header>

          <footer className="flex gap-3 min-w-max">
            <Link className="flex-1 min-w-[100px]" href="/customer/login" onClick={finalOnClose}
                  aria-label="Go to sign in page">
              <button
                className={clsx(
                    "w-full rounded-full bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 whitespace-nowrap",
                  pathname === "/customer/login"
                    ? " cursor-not-allowed"
                    : " cursor-pointer"
                )}
                disabled={pathname === "/customer/login"}
                type="button"
              >
                {modalT("signIn")}
              </button>
            </Link>

            <Link className="flex-1 min-w-[100px]" href="/customer/register" onClick={finalOnClose}
                  aria-label="Go to create account page">
              <button
                className={clsx(
                    "w-full rounded-full bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 whitespace-nowrap",
                  pathname === "/customer/register"
                    ? " cursor-not-allowed"
                    : " cursor-pointer"
                )}
                disabled={pathname === "/customer/register"}
                type="button"
              >
                {modalT("signUp")}
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
        shadow="md"
        classNames={{
          content: "min-w-[340px] p-0 rounded-xl",
        }}
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
        <PopoverContent className="min-w-75 px-4">
          <div className="px-2 py-4">
            {innerContent(finalOnClose)}
          </div>
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
            {/* 背景遮罩 - 优化透明度 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{duration: 0.2}}
              onClick={finalOnClose}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              style={{ top: "68px", bottom: "64px" }}
            />

            {/* 侧边抽屉 - 优化动画和样式 */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed right-0 z-50 flex flex-col border-l border-default-200 bg-white dark:border-default-800 dark:bg-black lg:hidden"
              style={{
                top: "68px",
                bottom: "64px",
                width: "100%",
                maxWidth: "448px",
                height: "calc(var(--visual-viewport-height) - 132px)",
              }}
            >
              {/* 头部标题栏 */}
              <div className="flex flex-col gap-1 border-b border-default-100 p-4 dark:border-default-800">
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-default-900 dark:text-white">{modalT("account")}</p>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="flex-1 overflow-y-auto px-4 py-6 drawer-scrollbar-hidden">
                {innerContent(finalOnClose)}
              </div>

              {/* 底部安全区域 */}
              <div className="h-6"/>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
