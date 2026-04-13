"use client";

import {useMutation} from "@tanstack/react-query";
import {useCustomToast} from "./useToast";
import {createProductReview, CreateProductReviewRequest} from "@/utils/api/trade";

export function useProductReview() {
  const {showToast} = useCustomToast();

  const {
    mutateAsync: createReview,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationFn: (reviewData: CreateProductReviewRequest) => createProductReview(reviewData),
    onSuccess: () => {
      showToast("Product review created successfully", "success");
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