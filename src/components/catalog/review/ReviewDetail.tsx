// src/components/catalog/review/ReviewDetail.tsx
"use client";
import React, {FC} from "react";
import {Rating} from "@/components/common/Rating";
import {Comment} from "@/types/api/product/type";

interface ReviewDetailProps {
  reviewDetails: Comment[];
  totalReview: number;
  productId: number;
}

export const ReviewDetail: FC<ReviewDetailProps> = ({
                                                      reviewDetails,
                                                      totalReview,
                                                      productId,
                                                    }) => {
  const reviews: Comment[] = reviewDetails;

  return (
      <div className="mt-5 space-y-4">
        {reviews.length > 0 ? (
            reviews.map((review) => (
                <div key={review.id} className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {review.userNickname}
                      </h3>
                      <Rating
                          length={5}
                          star={review.scores}
                          size="sm"
                      />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(review.createTime).toLocaleDateString()}
              </span>
                  </div>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    {review.content}
                  </p>
                  {review.picUrls && review.picUrls.length > 0 && (
                      <div className="mt-3 flex space-x-2">
                        {review.picUrls.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Review image ${index + 1}`}
                                className="w-16 h-16 object-cover rounded"
                            />
                        ))}
                      </div>
                  )}
                </div>
            ))
        ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No reviews yet. Be the first to review this product!
            </p>
        )}
      </div>
  );
};