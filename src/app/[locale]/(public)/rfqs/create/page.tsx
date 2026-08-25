import {Metadata} from "next";
import CreateRfqClient from "./CreateRfqClient";

export const metadata: Metadata = {
  title: "创建询价单 - B2B国际贸易采购平台",
  description: "创建B2B询价单，填写您的商品需求，获取供应商报价。支持国际贸易术语(FOB/CIF/EXW/DDP等多种贸易方式",
  keywords: "B2B询价, 国际贸易, 采购询价, FOB, CIF, 供应商报价",
  robots: {index: false, follow: false},
  openGraph: {
    title: "创建询价单 - B2B国际贸易采购平台",
    description: "创建B2B询价单，填写您的商品需求，获取供应商报价",
    type: "website",
  },
};

export default async function CreateRfqPageRoute({
                                                   searchParams,
                                                 }: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const {step = "contact"} = (await searchParams) as { step?: string };

  return <CreateRfqClient step={step}/>;
}