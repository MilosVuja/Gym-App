import { Routes, Route, Navigate } from "react-router-dom";
import ProfileLayout from "../layouts/ProfileLayout";
import PersonalDetails from "../components/sidebar/tabs/shared/PersonalDetails";
import Measurements from "../components/sidebar/tabs/shared/Measurements";
import Training from "../components/sidebar/tabs/shared/Training";
import Achievements from "../components/sidebar/tabs/shared/Achievements";
import Goals from "../components/sidebar/tabs/shared/Goals";
import Memberships from "../components/sidebar/tabs/shared/Memberships";
import Nutrition from "../components/sidebar/tabs/shared/Nutrition";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/members/profile/personal" replace />} />
      
      <Route path="/members/profile" element={<ProfileLayout />}>
        <Route index element={<Navigate to="personal" replace />} />
        <Route path="personal" element={<PersonalDetails />} />
        <Route path="memberships" element={<Memberships />} />
        <Route path="measurements" element={<Measurements />} />
        <Route path="training" element={<Training />} />
        <Route path="nutrition" element={<Nutrition />} />
        <Route path="goals" element={<Goals />} />
        <Route path="achievements" element={<Achievements />} />
      </Route>

      <Route path="*" element={<div className="p-6 text-white">Page Not Found</div>} />
    </Routes>
  );
}
