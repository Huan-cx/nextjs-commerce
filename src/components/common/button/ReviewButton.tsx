import {useRouter} from "next/navigation";
import {useAuthStatus} from "@utils/hooks/useAuthStatus";

export const ReviewButton = ({ setShowForm, className }: { setShowForm: (show: boolean) => void, className?: string }) => {
  const {isGuest} = useAuthStatus();
    const router = useRouter();
    const handleAddReview = () => {
      if (isGuest) {
            router.push("/customer/login");
        } else {
            setShowForm(true);
        }
    };

    return (
        <button
            onClick={handleAddReview}
            className={`relative flex w-full min-w-[18rem] max-w-[20rem] cursor-pointer h-fit items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white mt-6 ${className}`}
        > 
            Write a review
        </button>
    )

}