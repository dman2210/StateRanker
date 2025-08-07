import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  maxRating?: number;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  maxRating = 10, 
  readonly = false,
  size = "md"
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= rating;
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(starRating)}
            disabled={readonly}
            className={cn(
              sizeClasses[size],
              "focus:outline-none",
              !readonly && "hover:scale-110 transition-transform",
              readonly ? "cursor-default" : "cursor-pointer"
            )}
          >
            <StarIcon
              className={cn(
                "w-full h-full",
                isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
                !readonly && !isFilled && "hover:text-yellow-400"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
