import { ReviewButton } from "@components/common/button/ReviewButton";
import { NoReviewIcon } from "@components/common/icons/NoReviewsIcon";

export const NoReview = ({
  setShowForm,
}: {
  setShowForm: (show: boolean) => void;
}) => {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex flex-col items-center gap-4">
        <NoReviewIcon />
        <h2 className="font-outfit text-2xl font-semibold tracking-wide mt-4">
          Ratings
        </h2>
        <p className="text-lg mt-2">
          No reviews yet. Be the first to share your experience
        </p>
      </div>
      <ReviewButton setShowForm={setShowForm} />
    </div>
  );
};
