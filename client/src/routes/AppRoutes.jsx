import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import ProfileLayout from "../layouts/ProfileLayout";

import PersonalDetails from "../components/sidebar/tabs/shared/PersonalDetails";
import Measurements from "../components/sidebar/tabs/shared/Measurements";
import Training from "../components/sidebar/tabs/shared/Training";
import Achievements from "../components/sidebar/tabs/shared/Achievements";
import Goals from "../components/sidebar/tabs/shared/Goals";
import Memberships from "../components/sidebar/tabs/shared/Memberships";
import Nutrition from "../components/sidebar/tabs/shared/Nutrition";
import Health from "../components/sidebar/tabs/shared/Health";

import CreateTrainingPlan from "../pages/shared/MakeYourTraining";
import AddExercises from "../pages/shared/AddExercises";
import CreateNutritionPlan from "../pages/shared/CreateNutritionPlan";
import CreateMealPlan from "../pages/shared/CreateMealPlan";

import AdminApproval from "../pages/admin/AdminApproval";
import LoginPage from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import RequireAuth from "../components/auth/RequireAuth";
import RequireAdmin from "../components/auth/RequireAdmin";

export default function AppRoutes() {
  return (
    <Routes>
      {/* / */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={<Navigate to="/members/profile/personal" replace />}
      />

      {/* /admin */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireAdmin>
              <Outlet />
            </RequireAdmin>
          </RequireAuth>
        }
      >
        <Route path="approval" element={<AdminApproval />} />
      </Route>

      {/* Member routes with ProfileLayout */}
      <Route
        path="/members"
        element={
          <RequireAuth>
            <ProfileLayout />
          </RequireAuth>
        }
      >
        {/* /profile/ tabs */}
        <Route path="profile">
          <Route index element={<Navigate to="personal" replace />} />
          <Route path="personal" element={<PersonalDetails />} />
          <Route path="memberships" element={<Memberships />} />
          <Route path="measurements" element={<Measurements />} />
          <Route path="training" element={<Training />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="health" element={<Health />} />
          <Route path="goals" element={<Goals />} />
          <Route path="achievements" element={<Achievements />} />
        </Route>

        {/* /members */}
        <Route path="create-training-plan" element={<CreateTrainingPlan />} />
        <Route path="create-nutrition-plan" element={<CreateNutritionPlan />} />
        <Route path="meal-planner" element={<CreateMealPlan />} />
      </Route>

      {/* / sa autorizacijom */}
      <Route
        path="/add-exercises"
        element={
          <RequireAuth>
            <AddExercises />
          </RequireAuth>
        }
      />

      <Route
        path="*"
        element={<div className="p-6 text-white">Page Not Found</div>}
      />
    </Routes>
  );
}
