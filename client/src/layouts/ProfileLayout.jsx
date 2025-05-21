import { Outlet } from "react-router-dom";

export default function ProfileLayout() {
  return (
    <div className="flex-1 p-6 text-white bg-gray-800">
      <Outlet />
    </div>
  );
}
