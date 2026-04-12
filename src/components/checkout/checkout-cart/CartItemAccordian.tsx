import {useScrollTo} from "@/utils/hooks/useScrollTo";
import {Price} from "@components/theme/ui/Price";
import {Accordion, AccordionItem} from "@heroui/accordion";
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/24/outline";
import {createUrl} from "@utils/helper";
import Image from "next/image";
import Link from "next/link";
import {Cart, CartItem} from "@/types/api/trade/cart";
import {OrderSettlement} from "@utils/api/trade";

type MerchandiseSearchParams = {
  [key: string]: string;
};

export default function CartItemAccordion({
  cartItems,
                                            settlementData,
}: {
  cartItems?: Cart,
  settlementData: OrderSettlement | null
}) {

  const cart = Array.isArray(cartItems?.items)
      ? cartItems?.items
    : [];

  // Pre-settlement calculation
  const preSettlementSubtotal = cart.reduce((total, item) => {
    return total + (item.count * item.sku.price);
  }, 0);

  const scrollTo = useScrollTo();

  return (
    <div className="mobile-heading fixed bottom-0 left-0 z-50 w-full border-t border-neutral-200 bg-white pb-14
     dark:border-neutral-700 dark:bg-black lg:hidden">
      <Accordion
        selectionMode="multiple"
        className="!px-0"
        onSelectionChange={(e) => {
          const keys = e as Set<string>;
          if (keys.has("1")) {
            setTimeout(() => {
              scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              });
            }, 300);
          }
        }}
      >
        <AccordionItem
          key="1"
          indicator={({ isOpen }) =>
            isOpen ? (
              <ChevronLeftIcon className="h-5 w-5 stroke-neutral-800 dark:stroke-white" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 stroke-neutral-800 dark:stroke-white" />
            )
          }
          classNames={{
    heading: "px-4", 
    content: "px-4" 
  }}
          aria-label="Accordion 1"
          title="Order Summary"
          subtitle={
            <Price
              className=""
              amount={(settlementData?.price?.payPrice ?? preSettlementSubtotal).toString()}
              currencyCode={"USD"}
            />
          }
        >
          <div className="flex h-full flex-col justify-between px-4">
            <ul className="flex-grow overflow-y-auto max-h-[300px] py-4 pr-2 -mr-2" style={{ scrollbarWidth: 'thin' }}>
              {cart?.map((item: CartItem, i: number) => {
                const merchandiseSearchParams = {} as MerchandiseSearchParams;
                const merchandiseUrl = createUrl(
                    `/product/${item?.spu?.id}`,
                                new URLSearchParams(merchandiseSearchParams)
                              );
                return (
                  <li key={i} className="flex w-full flex-col">
                    <div className="relative flex w-full flex-row justify-between gap-3 px-1 py-4">
                      <Link
                        href={merchandiseUrl}
                        className="z-30 flex flex-row items-center space-x-4"
                        aria-label={`${item?.spu?.name}`}
                      >
                        <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                          <Image
                            className="h-full w-full object-cover"
                            width={64}
                            height={64}
                            alt={item?.spu?.name}
                            src={item?.sku?.picUrl || item?.spu?.picUrl || ""}
                          />
                        </div>

                        <div className="flex flex-1 flex-col text-base">
                          <span className="leading-tight text-neutral-900 line-clamp-1 dark:text-white">
                            {item?.spu?.name}
                          </span>
                          <span className="font-normal text-black dark:text-white">
                            Quantity : {item?.count}
                          </span>
                          {item?.sku?.properties && item?.sku?.properties.length > 0 && (
                            <p className="text-sm lowercase line-clamp-1 text-neutral-500 dark:text-neutral-400">
                              {item?.sku?.properties.map(prop => prop.valueName).join(', ')}
                            </p>
                          )}
                        </div>
                      </Link>
                      <div className="flex h-16 flex-col justify-between text-black/[60%] dark:!text-neutral-300">
                        <Price
                          className="flex justify-end space-y-2 text-right text-sm"
                          amount={(item?.sku?.price).toString()}
                          currencyCode={"USD"}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
              <div className="mb-3 flex items-center justify-between pb-1">
                <p className="text-black[60%] font-outfit text-base font-normal dark:text-white">
                  Subtotal
                </p>
                <Price
                  className="text-right text-base text-black dark:text-white"
                  amount={(settlementData?.price?.totalPrice ?? preSettlementSubtotal).toString()}
                  currencyCode={"USD"}
                />
              </div>
              <div className="mb-3 flex items-center justify-between pb-1 pt-1">
                <p className="text-black[60%] font-outfit text-base font-normal dark:text-white">
                  Shipping
                </p>
                {settlementData?.price?.deliveryPrice ? (
                  <Price
                      amount={(settlementData.price.deliveryPrice).toString()}
                    className="text-right text-base text-black dark:text-white"
                    currencyCode={"USD"}
                  />
                ) : (
                  <p className="text-right text-base">
                    Calculated at Next Step
                  </p>
                )}
              </div>
              <div className="mb-3 flex items-center justify-between pb-1 pt-1">
                <p className="text-black[60%] font-outfit text-base font-normal dark:text-white">
                  Tax
                </p>
                <Price
                    amount={(settlementData?.price ?? 0).toString()}
                    className="text-right text-base text-black dark:text-white"
                    currencyCode={"USD"}
                />
              </div>
              <div className="mb-3 flex items-center justify-between pb-1 pt-1">
                <p className="text-xl font-bold dark:text-white">Total</p>
                <Price
                  className="text-right text-base text-black dark:text-white"
                  amount={(settlementData?.price?.payPrice ?? preSettlementSubtotal).toString()}
                  currencyCode={"USD"}
                />
              </div>
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}