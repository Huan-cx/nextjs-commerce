"use client";

import {ORDER_ID} from "@/utils/constants";
import {getCookie} from "@utils/getCartToken";
import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";

export default function OrderDetail() {
  const t = useTranslations("order");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      setOrderId(getCookie(ORDER_ID));
    });
  }, []);

  return (
    <div className="mb-8 font-outfit">
      <h1 className="my-2 text-center text-3xl font-semibold sm:text-4xl">
        {t("orderPlaced")}{" "}
        <span className="text-primary">
          #{orderId ? orderId : <span className="animate-pulse">...</span>}
        </span>
      </h1>
      <p className="text-center text-lg font-normal text-black/60 dark:text-neutral-300">
        {t("missingPage")}
      </p>
    </div>
  );
}