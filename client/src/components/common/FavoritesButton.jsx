import { FaStar, FaRegStar } from "react-icons/fa";

export default function FavoritesButton({ isFavorite, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className="text-xl"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      type="button"
    >
      {isFavorite ? (
        <FaStar className="text-yellow-400" />
      ) : (
        <FaRegStar className="text-gray-400" />
      )}
    </button>
  );
}