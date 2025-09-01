'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAddReviewMutation } from '@/redux/features/reviewApi';
import { Send, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { authClient } from '../../../lib/authClient';

// Consistent Rating Component
const RatingInput = ({ rating, onRatingChange, disabled = false }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);

      return (
        <button
          key={index}
          type="button"
          className={`p-1 transition-colors ${
            isFilled ? 'text-yellow-400' : 'text-muted-foreground/30'
          } hover:text-yellow-400 ${
            disabled ? 'cursor-not-allowed opacity-50' : 'hover:text-yellow-400'
          }`}
          onClick={() => !disabled && onRatingChange(starValue)}
          onMouseEnter={() => !disabled && setHoveredRating(starValue)}
          onMouseLeave={() => !disabled && setHoveredRating(0)}
          disabled={disabled}
          aria-label={`Rate ${starValue} stars`}
        >
          <Star className="w-6 h-6 fill-current" />
        </button>
      );
    });
  };

  return (
    <div className="flex items-center gap-2">
      {renderStars()}
      <span className="text-sm text-muted-foreground ml-2">
        {rating > 0
          ? `${rating} star${rating > 1 ? 's' : ''}`
          : 'Select rating'}
      </span>
    </div>
  );
};

export default function ReviewForm({ productId, onSuccess }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [addReview, { isLoading: isSubmitting }] = useAddReviewMutation();
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    comment: '',
  });

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Check if user is signed in
    if (!session) {
      toast.error(
        <div className="flex flex-col gap-2">
          <span>Please sign in to submit a review</span>
          <Link
            href="/sign-in"
            className="text-primary hover:underline font-medium"
          >
            Sign In →
          </Link>
        </div>,
        {
          duration: 5000,
          action: {
            label: 'Sign In',
            onClick: () => router.push('/sign-in'),
          },
        }
      );
      return;
    }

    // Validate required fields
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!formData.comment.trim()) {
      toast.error('Please provide a review comment');
      return;
    }

    try {
      // Prepare review data
      const reviewData = {
        userId: session.user.id,
        productId: productId,
        rating: rating,
        comment: formData.comment.trim(),
        title: formData.title.trim() || undefined, // Optional field
      };

      // Submit review
      const result = await addReview(reviewData).unwrap();

      // Show success message
      toast.success('Review submitted successfully!');

      // Reset form
      setRating(0);
      setFormData({
        title: '',
        comment: '',
      });

      // Call onSuccess callback if provided (to close dialog, refresh data, etc.)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Handle specific error cases
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error?.status === 400) {
        toast.error('You have already reviewed this product');
      } else if (error?.status === 403) {
        toast.error('You must purchase this product before reviewing');
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Write a Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-3">
            <Label htmlFor="rating" className="text-sm font-medium">
              Rating *
            </Label>
            <RatingInput
              rating={rating}
              onRatingChange={setRating}
              disabled={isSubmitting}
            />
          </div>

          {/* User Info Display */}
          <div className="p-4 bg-muted/20 rounded-lg">
            <div className="text-sm text-muted-foreground">
              Reviewing as:{' '}
              <span className="font-medium text-foreground">
                {session?.user?.name || session?.user?.email}
              </span>
            </div>
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Review Title (Optional)
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief summary of your experience"
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Review Comment *
            </Label>
            <Textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Share your detailed experience with this product..."
              required
              rows={4}
              disabled={isSubmitting}
              className="w-full resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={rating === 0 || isSubmitting}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
