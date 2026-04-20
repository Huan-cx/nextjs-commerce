"use server";
import {redirect} from "next/navigation";
import {RecoverPasswordFormState} from "@components/customer/types";


export async function redirectToCheckout(formData: FormData) {
  const url = formData.get("url") as string;
  redirect(url);
}

export async function userSubscribe(
  _prevState: RecoverPasswordFormState,
  formData: FormData
): Promise<RecoverPasswordFormState> {
  const email = formData.get("email");
  if (!email) {
    return {
      errors: {
        apiRes: {
          status: false,
          msg: "Email is required",
        },
      },
    };
  }
  return {
    errors: {
      apiRes: {
        status: true,
        msg: "Subscription successful!",
      },
    },
  };


  /* const data = {
    email: typeof email === "string" ? email.trim() : "",
  };

  try {

    if (result?.error) {
      const error = result.error as Record<string, unknown>;
      return {
        errors: {
          apiRes: {
            status: false,
            msg: (error.message as string) || "Something went wrong",
          },
        },
      };
    }

    const body = result?.body as Record<string, unknown>;
    const bodyData = body?.data as Record<string, unknown>;

    return {
      errors: {
        apiRes: {
          status: true,
          msg: (bodyData?.message as string) || "Subscription successful!",
        },
      },
    };
  } catch {
    return {
      errors: {
        apiRes: {
          status: false,
          msg: "Unexpected error occurred. Please try again.",
        },
      },
    };
  }*/
}