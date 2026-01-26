import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Building2 } from 'lucide-react';
import { Review } from '@/types/review';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <Card className="p-6 border border-border bg-card">
      <div className="flex items-start space-x-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {review.reviewerName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-body font-medium text-foreground mb-1">
                {review.reviewerName}
              </h4>
              {review.reviewerCompany && (
                <div className="flex items-center text-caption text-muted-foreground">
                  <Building2 className="w-3 h-3 mr-1" strokeWidth={1.5} />
                  {review.reviewerCompany}
                </div>
              )}
            </div>
            <span className="text-caption text-muted-foreground">
              {new Date(review.date).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center space-x-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? 'text-accent fill-accent'
                    : 'text-muted-foreground'
                }`}
                strokeWidth={1.5}
              />
            ))}
            <span className="ml-2 text-body-sm font-medium text-foreground">
              {review.rating}.0
            </span>
          </div>

          <p className="text-body-sm text-foreground leading-relaxed">
            {review.comment}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ReviewCard;
