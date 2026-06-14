"use client";

import {Avatar, Divider, Listbox, ListboxItem} from "@heroui/react";
import {ChevronRight, FileText, MapPin, Package, User as UserIcon} from "lucide-react";
import {useRouter} from "next/navigation";
import {useMediaQuery} from "@utils/hooks/useMediaQueryHook";
import clsx from "clsx";
import {useLocale, useTranslations} from "next-intl";

export const AccountSidebar = ({
                                 user,
                                 activeKey,
                                 onSelect,
                                 className
                               }: {
  user?: any;
  activeKey: string;
  onSelect: (key: string) => void;
  className?: string;
}) => {
  const t = useTranslations("accountSidebar");
  const headerT = useTranslations("header");
  const router = useRouter();
  const locale = useLocale();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const menuItems = [
    {key: "profile", label: headerT("profile"), icon: <UserIcon size={18}/>},
    {key: "address", label: headerT("address"), icon: <MapPin size={18}/>},
    {key: "b2b-rfq", label: headerT("b2bRfq"), icon: <FileText size={18}/>},
    {key: "orders", label: headerT("orders"), icon: <Package size={18}/>},
  ];

  return (
      <aside className={clsx("w-full md:w-72 space-y-4 flex-shrink-0", className)}>
        {/* 用户信息卡片 */}
        <div
            className="flex items-center gap-3 p-4 border border-default-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <Avatar
              isBordered
              color="primary"
              radius="full"
              size="lg"
              src={user?.avatar}
              className="flex-shrink-0"
              showFallback
              fallback={<UserIcon size={24}/>}
          />
          <div className="flex flex-col truncate min-w-0">
            <h4 className="font-bold text-default-900 truncate text-sm md:text-base">
              {t("hello")} {user?.nickname || t("user")}
            </h4>
            <p className="text-tiny text-default-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* 导航菜单卡片 */}
        <div className="border border-default-100 rounded-xl overflow-hidden bg-white shadow-sm">
          <div
              className="px-5 py-4 font-bold text-xs uppercase tracking-widest bg-default-50/50 text-default-500">
            {t("title")}
          </div>
          <Divider className="opacity-50"/>
          <Listbox
              variant="flat"
              aria-label="Account Navigation"
              selectedKeys={[activeKey]}
              onAction={(key) => {
                // ✅ 必须带上 locale 前缀，否则 i18n 路由不匹配
                const navTarget = `/${locale}/account/${key}`;
                if (isDesktop) {
                  router.push(navTarget);
                } else {
                  onSelect(key.toString());
                }
              }}
              className="p-1 w-full"
              itemClasses={{
                base: [
                  "rounded-lg",
                  "mx-2",
                  "my-0.5",
                  "px-3",
                  "py-2.5",
                  "gap-3",
                  "data-[selected=true]:bg-primary/10",
                  "data-[selected=true]:text-primary",
                  "data-[hover=true]:bg-default-100/60",
                  "transition-colors duration-150",
                ],
                title: "text-sm font-semibold",
                wrapper: "w-full",
              }}
          >
            {menuItems.map((item) => (
                <ListboxItem
                    key={item.key}
                    startContent={
                      <span className={clsx(
                          "transition-colors duration-150",
                          activeKey === item.key ? "text-primary" : "text-default-400"
                      )}>
                        {item.icon}
                      </span>
                    }
                    endContent={isDesktop && (
                        <ChevronRight
                            size={16}
                            className={clsx(
                                "transition-colors duration-150",
                                activeKey === item.key ? "text-primary" : "text-default-300"
                            )}
                        />
                    )}
                >
                  {item.label}
                </ListboxItem>
            ))}
          </Listbox>
        </div>
      </aside>
  );
};