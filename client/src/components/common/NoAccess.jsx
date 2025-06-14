import { useNavigate } from "react-router-dom";

export default function NoAccess() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
      <p className="mb-6 text-lg text-center max-w-md">
        Sorry, you do not have permission to view this page.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition"
      >
        Go to Home
      </button>
    </div>
  );
}
