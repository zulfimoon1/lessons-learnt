
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  labels?: string[];
  className?: string;
}

const StarRating = ({ rating, onRatingChange, labels = [], className }: StarRatingProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            <Star
              className={cn(
                "w-8 h-8 transition-colors duration-200",
                star <= rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-sm font-medium text-gray-600 ml-2">
            {rating}/5
          </span>
        )}
      </div>
      
      {labels.length > 0 && rating > 0 && (
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border">
          <span className="font-medium">{labels[rating - 1]}</span>
        </div>
      )}
    </div>
  );
};

export default StarRating;
