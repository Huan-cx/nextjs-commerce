import {Metadata} from "next";
import InquiryContactClient from "./InquiryContactClient";

export const metadata: Metadata = {
    title: "大宗采购询价 - B2B国际贸易采购平台",
    description: "发起大宗采购询价，填写联系方式、预算与需求描述，获取源头工厂报价单。",
    keywords: "B2B询价, 大宗采购, 工程采购, 批量询价, 供应商报价",
    robots: {index: false, follow: false},
    openGraph: {
        title: "大宗采购询价 - B2B国际贸易采购平台",
        description: "发起大宗采购询价，获取源头工厂报价单",
        type: "website",
    },
};

export default async function InquiryContactPage() {
    return <InquiryContactClient/>;
}
