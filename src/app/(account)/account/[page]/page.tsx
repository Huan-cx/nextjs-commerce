import {AccountContainer} from "@components/account";
import {getUserInfo} from "@utils/api/member";

export default async function Page({params}: { params: Promise<{ page: string }>; }) {
  const userInfo = await getUserInfo();
  console.log(userInfo);
  const {page: pageParams} = await params;
  return <AccountContainer userInfo={userInfo} activeKey={pageParams}/>;
}
