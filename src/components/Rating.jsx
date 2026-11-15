import { Icon } from "./Icon.jsx";

// compact rating for product cards
export function RatingBadge({ rating }) {
  return (
    <span className="rating" aria-label={"Rated " + rating.toFixed(1) + " out of 5"}>
      <Icon name="star" className="icon-fill" />
      {rating.toFixed(1)}
    </span>
  );
}

// five stars with the number next to them
export function RatingStars({ rating }) {
  return (
    <div className="rating">
      <span className="rating-stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon key={star} name="star" className={rating >= star - 0.5 ? "icon-fill" : "icon-fill is-empty"} />
        ))}
      </span>
      <span className="rating-number">{rating.toFixed(1)} rating</span>
    </div>
  );
}
