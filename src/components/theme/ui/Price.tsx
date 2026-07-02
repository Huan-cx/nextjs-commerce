"use client";

import {fenToYuan} from "@/utils/formatNumber";
import {useGlobalContext} from "@/providers/GlobalContextProvider";

interface PriceProps {
  amount: number | string;
  className?: string;
  currencyCode?: string;
  forceShow?: boolean;
  variant?: "default" | "hidden";
  children?: React.ReactNode;
}

export const Price = ({
                        amount,
                        className = "",
                        currencyCode = "USD",
                        forceShow = false,
                        variant = "default",
                        children,
                        ...rest
                      }: PriceProps & React.ComponentProps<"p">) => {
  const context = useGlobalContext();
  const priceConfig = context?.priceConfig;

  // 是否显示价格：强制显示 或 全局配置开启
  const shouldShowPrice = forceShow || (priceConfig && priceConfig.showPrice);

  if (variant === "hidden" || !shouldShowPrice) {
    return null;
  }

  const priceInYuan = parseFloat(fenToYuan(amount));

  return (
      <p className={className} suppressHydrationWarning={true} {...rest}>
        {`${new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: currencyCode,
          currencyDisplay: "narrowSymbol",
        }).format(priceInYuan)}`}
      </p>
  );
};

export interface PriceWrapperProps {
  children: React.ReactNode;
  forceShow?: boolean;
}

export const PriceWrapper = ({children, forceShow = false}: PriceWrapperProps) => {
  const context = useGlobalContext();
  const priceConfig = context?.priceConfig;

  if (forceShow || (priceConfig && priceConfig.showPrice)) {
    return <>{children}</>;
  }

  return null;
};
