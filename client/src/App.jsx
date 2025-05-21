import Header from "./components/Header";
import Sidebar from "./components/sidebar/Sidebar";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <div>
      <Header />
      <div className="flex">
        <Sidebar />
        <AppRoutes />
      </div>
    </div>
  );
}
