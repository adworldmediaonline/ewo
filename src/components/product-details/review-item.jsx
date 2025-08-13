import dayjs from 'dayjs';
import { Rating } from 'react-simple-star-rating';

export default function ReviewItem({ review }) {
  const { comment, createdAt, rating, userId, guestName } = review || {};

  return (
    <div className="">
      <div className="">
        <div className="">
          <div className="">
            {(userId?.name || guestName || 'Anonymous').charAt(0).toUpperCase()}
          </div>
          <div className="">
            <div className="" style={{ textTransform: 'capitalize' }}>
              {userId?.name || guestName || 'Anonymous'}
            </div>
            <div className="">{dayjs(createdAt).format('MMMM D, YYYY')}</div>
          </div>
        </div>
        <div className="">
          <Rating
            allowFraction
            size={16}
            initialValue={rating}
            readonly={true}
          />
          <span className="">({rating}/5)</span>
        </div>
      </div>

      {comment && (
        <div className="">
          <p className="">{comment}</p>
        </div>
      )}
    </div>
  );
}
