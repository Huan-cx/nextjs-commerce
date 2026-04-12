"use client";

import {useState} from "react";
import {Modal, ModalContent} from "@heroui/react";
import AddProductReview from "./AddProductReview";
import {ReviewButton} from "@components/common/button/ReviewButton";
import {NoReview} from "./NoReview";

interface ReviewSectionProps {
  productId: number;
  className?: string;
  totalReview: number;
}

export default function ReviewSection({
  productId,
  className,
  totalReview,
}: ReviewSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div>
        {totalReview > 0 ? (
          <ReviewButton setShowForm={setOpen} className={className} />
        ) : (
          <NoReview setShowForm={setOpen} />
        )}
      </div>

      <Modal
        isOpen={open}
        onOpenChange={setOpen}
        backdrop="blur"
        size="4xl"
        hideCloseButton
        scrollBehavior="inside"
        placement="center"
        classNames={{
          wrapper: "z-[100] items-center justify-center",
          backdrop: "z-[99]",
          base: "bg-white/90 dark:bg-black/80 backdrop-blur-xl  rounded-xl mx-4",
        }}
      >
        <ModalContent className="p-0 border-none">
          {(onClose) => (
            <AddProductReview
              productId={productId}
              onClose={onClose}
            />
          )}
        </ModalContent>
      </Modal>
    </>
  );
}


