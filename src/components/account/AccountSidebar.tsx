"use client";

import {Avatar, Divider, Listbox, ListboxItem} from "@heroui/react";
import {ChevronRight, MapPin, Package, User} from "lucide-react";
import {useRouter} from "next/navigation";
import {useMediaQuery} from "@utils/hooks/useMediaQueryHook";
import clsx from "clsx";

const menuItems = [
  {key: "profile", label: "Profile", icon: <User size={18}/>},
  {key: "orders", label: "Orders", icon: <Package size={18}/>},
  {key: "address", label: "Address", icon: <MapPin size={18}/>},
  // {key: "downloads", label: "Downloadable Products", icon: <Download size={18}/>},
  // {key: "reviews", label: "Reviews", icon: <Star size={18}/>},
  // {key: "wishlist", label: "Wishlist", icon: <Heart size={18}/>},
];

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
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
      <aside className={clsx("w-full md:w-80 space-y-4 md:space-y-6 flex-shrink-0", className)}>
        {/* 用户信息卡片 */}
        <div
            className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-default-100 rounded-xl bg-white shadow-sm">
          <Avatar
              isBordered
              color="default"
              radius="full"
              size="md"
              src={user?.avatar}
              className="flex-shrink-0"
          />
          <div className="flex flex-col truncate">
            <h4 className="font-bold text-default-900 truncate text-sm md:text-base">Hello! {user?.nickname || "User"}</h4>
            <p className="text-tiny text-default-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* 导航菜单卡片 */}
        <div className="border border-default-100 rounded-xl overflow-hidden bg-white shadow-sm">
          <div
              className="px-4 md:px-6 py-3 md:py-4 font-bold text-xs uppercase tracking-widest bg-default-50 text-default-500">
            My Account
          </div>
          <Divider/>
          <Listbox
              variant="flat"
              aria-label="Account Navigation"
              selectedKeys={[activeKey]}
              onAction={(key) => {
                if (isDesktop) {
                  router.push(`/account/${key}`);
                } else {
                  onSelect(key.toString());
                }
              }}
              className="p-0"
              itemClasses={{
                base: [
                  "rounded-none",
                  "px-4 md:px-6",
                  "py-3 md:py-4",
                  "gap-3 md:gap-4",
                  "data-[selected=true]:bg-default-100", // 选中项灰色背景
                  "data-[selected=true]:text-default-900",
                  "data-[hover=true]:bg-default-50",
                ],
                title: "text-sm md:text-base font-medium",
              }}
          >
            {menuItems.map((item) => (
                <ListboxItem
                    key={item.key}
                    startContent={<span className="text-default-500">{item.icon}</span>}
                    endContent={isDesktop && <ChevronRight size={16} className="text-default-300"/>}
                >
                  {item.label}
                </ListboxItem>
            ))}
          </Listbox>
        </div>
      </aside>
  );
};