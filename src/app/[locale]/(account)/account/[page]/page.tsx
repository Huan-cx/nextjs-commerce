import {AccountContainer} from "@components/account";
import {get} from "@utils/request/server"; // ✅ 服务端用 server.ts
import {Metadata} from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: {index: false, follow: false},
    title: "My Account",
  };
}

export default async function Page(props: {
  params: Promise<{ page: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // ✅ 认证保护已在上级 (account)/layout.tsx 中统一处理
  // 这里不需要重复检查
  const userInfo = await get("member/user/get", {}, {
    contentType: true,
    requiresAuth: true,
  });
  const {page: pageParams} = await props.params;
  const searchParams = await props.searchParams;

  // 从搜索参数中提取 quotationId
  const quotationId = searchParams?.quotationId
      ? Number(searchParams.quotationId as string)
      : undefined;

  return <AccountContainer
      userInfo={userInfo}
      activeKey={pageParams}
      quotationId={quotationId}
  />;
}
