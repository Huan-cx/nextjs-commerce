"use client";

import {useMutation} from "@tanstack/react-query";
import {useCustomToast} from "./useToast";
import {createProductReview, CreateProductReviewRequest} from "@/utils/api/trade";
import {useTranslations} from "next-intl";

export function useProductReview() {
  const {showToast} = useCustomToast();
  const t = useTranslations("productReview");

  const {
    mutateAsync: createReview,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: (reviewData: CreateProductReviewRequest) => createProductReview(reviewData),
    onSuccess: () => {
      showToast(t("submitSuccess"), "success");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      showToast(message, "danger");
    },
  });

  return {
    createReview,
    isLoading,
    error,
  };
}