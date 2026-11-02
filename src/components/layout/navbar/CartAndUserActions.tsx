import {Suspense} from "react";
import Cart from "@/components/cart";
import UserAccount from "@components/customer/credentials";
import ThemeSwitcherWrapper from "@components/theme/theme-switch";
import {IconSkeleton} from "@components/common/skeleton/IconSkeleton";
import LanguageSwitcher from "@components/locals/LanguageSwitcher";

/**
 * 购物车和用户操作组件
 *
 * 【架构说明】
 * SessionProvider 已在 GlobalProviders 最外层统一提供
 * 此处无需嵌套 SessionManager，全应用共享同一份 session 状态
 */
export function CartAndUserActions() {
  return (
    <div className="flex max-w-fit gap-2 md:gap-4">
      <div className="flex">
        <ThemeSwitcherWrapper />
      </div>
      <div className="flex">
        <LanguageSwitcher/>
      </div>
      <div className="hidden lg:block">
        <Cart />
      </div>
      <Suspense fallback={<IconSkeleton />}>
        <div className="hidden lg:block">
          <UserAccount/>
        </div>
      </Suspense>
    </div>
  );
}
