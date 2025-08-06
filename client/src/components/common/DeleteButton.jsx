import { FaMinusCircle } from "react-icons/fa";

export default function DeleteButton({ onDelete, name }) {
  return (
    <button
      onClick={onDelete}
      className="ml-3 text-red-500 hover:text-red-700"
      title={`Delete ${name}`}
      type="button"
      aria-label={`Delete ${name}`}
    >
      <FaMinusCircle className="size-4 mr-1.5" />
    </button>
  );
}