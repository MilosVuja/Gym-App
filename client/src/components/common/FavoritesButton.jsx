import { FaStar, FaRegStar } from "react-icons/fa";

export default function FavoritesButton({ isFavorite, onToggle }) {
  return (
    <button onClick={onToggle} className="text-xl">
      {isFavorite ? (
        <FaStar className="text-yellow-400" />
      ) : (
        <FaRegStar className="text-gray-400" />
      )}
    </button>
  );
}
