import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetName: string;
  targetRole: 'candidate' | 'employer';
  onSubmit: (rating: number, comment: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  open,
  onOpenChange,
  targetName,
  targetRole,
  onSubmit,
}) => {
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      showToast({
        title: 'Error',
        description: 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }

    if (!comment.trim()) {
      showToast({
        title: 'Error',
        description: 'Please write a review',
        variant: 'destructive',
      });
      return;
    }

    onSubmit(rating, comment);
    setRating(0);
    setComment('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setRating(0);
    setComment('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-h3 font-heading text-foreground">
            Write a Review
          </DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            Share your experience with {targetName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label className="text-body-sm font-medium text-foreground mb-3 block">
              Rating <span className="text-error">*</span>
            </Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-accent fill-accent'
                        : 'text-muted-foreground'
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-4 text-h4 font-heading text-foreground">
                  {rating}.0
                </span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="reviewComment" className="text-body-sm font-medium text-foreground mb-2 block">
              Your Review <span className="text-error">*</span>
            </Label>
            <textarea
              id="reviewComment"
              placeholder={`Share your experience working with ${targetName}...`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full min-h-[150px] px-4 py-3 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <p className="text-caption text-muted-foreground mt-2">
              Minimum 20 characters ({comment.length}/20)
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || comment.length < 20}
            className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
          >
            Submit Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
