import { useState } from 'react';
import './StarRating.css';

export default function StarRating({ rating = 0, onChange, size = 'md', readonly = false }) {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'sm' ? 'star-sm' : size === 'lg' ? 'star-lg' : '';

  return (
    <div className={`star-rating ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star-icon ${star <= (hover || rating) ? 'filled' : ''} ${readonly ? 'readonly' : ''}`}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
