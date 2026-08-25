import {Suspense} from "react";
import ResetPasswordForm from "@components/customer/ResetPasswordForm";
import {AuthPlaceHolder} from "@components/common/skeleton/AuthPlaceHolder";
import {Metadata} from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: {index: false, follow: false},
    title: "Reset Password",
  };
}

export default function ResetPasswordPage() {
  return (
      <Suspense fallback={<AuthPlaceHolder/>}>
        <ResetPasswordForm/>
      </Suspense>
  );
}