import {fenToYuan} from "@/utils/formatNumber";

export const Price = ({
  amount,
  className,
  currencyCode = "USD",
  ...rest
}: {
  amount: number | string;
  className?: string;
  currencyCode: string;
} & React.ComponentProps<"p">) => {
  // 使用 fenToYuan 转换价格（分转元）
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