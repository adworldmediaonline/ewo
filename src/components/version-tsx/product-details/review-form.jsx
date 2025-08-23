'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Star } from 'lucide-react';
import { useState } from 'react';

// Consistent Rating Component
const RatingInput = ({ rating, onRatingChange }) => {
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
          } hover:text-yellow-400`}
          onClick={() => onRatingChange(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
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

const ReviewForm = ({ productId }) => {
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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

  const handleSubmit = e => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Review submitted:', { rating, ...formData, productId });
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
            <RatingInput rating={rating} onRatingChange={setRating} />
          </div>

          {/* Name and Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
                className="w-full"
              />
            </div>
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Review Title *
            </Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief summary of your experience"
              required
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
              className="w-full resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={rating === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
