import CheckOut from "@/components/checkout";
import {generateMetadataForPage} from "@utils/helper";
import {Metadata} from "next";
import {BeginCheckoutTracker} from "@/components/analytics/trackers/BeginCheckoutTracker";

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataForPage("checkout", {
    title: "Checkout",
    description: "Complete your purchase",
  }, undefined, true);
}

export default async function Information({
                                            searchParams,
                                          }: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const {step = "email"} = (await searchParams) as { [key: string]: string };
  return <>
    {/* 发起结算事件追踪 */}
    <BeginCheckoutTracker/>
    <CheckOut step={step}/>
  </>;
}
