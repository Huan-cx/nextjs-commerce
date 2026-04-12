import {FC} from "react";
import OrderReview from "./OrderReview";
import {OrderSettlement} from "@utils/api/trade";

export const Review: FC<{
  settlementData?: OrderSettlement | null;
}> = ({
        settlementData,
}) => {
  return (
    <OrderReview
        settlementData={settlementData}
    />
  );
};

export default Review;