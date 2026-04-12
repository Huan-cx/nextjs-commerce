import {Suspense} from "react";
import ResetPasswordForm from "@components/customer/ResetPasswordForm";
import {AuthPlaceHolder} from "@components/common/skeleton/AuthPlaceHolder";

export default function ResetPasswordPage() {
  return (
      <Suspense fallback={<AuthPlaceHolder/>}>
        <ResetPasswordForm/>
      </Suspense>
  );
}