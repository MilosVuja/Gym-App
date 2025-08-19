import { useLocation } from "react-router-dom";
import Header from "./common/Header";
import Sidebar from "./features/sidebar/Sidebar";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const location = useLocation();

  const noLayoutPaths = ["/login", "/register"];

  const showLayout = !noLayoutPaths.includes(location.pathname);

  return (
    <div>
      {showLayout && <Header />}
      <div className="flex">
        {showLayout && <Sidebar />}
        <AppRoutes />
      </div>
    </div>
  );
}
