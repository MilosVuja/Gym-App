import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import ProfileLayout from "../layouts/ProfileLayout";

import PersonalDetails from "../features/sidebar/tabs/shared/PersonalDetails";
import Measurements from "../features/sidebar/tabs/shared/Measurements";
import Training from "../features/sidebar/tabs/shared/Training";
import Achievements from "../features/sidebar/tabs/shared/Achievements";
import Goals from "../features/sidebar/tabs/shared/Goals";
import Memberships from "../features/sidebar/tabs/shared/Memberships";
import Nutrition from "../features/sidebar/tabs/shared/Nutrition";
import Health from "../features/sidebar/tabs/shared/Health";

import TrainingPlanner from "../features/trainingPlanner/TrainingPlanner";
import AddExercises from "../features/trainingPlanner/AddExercises";
import NutritionPlanner from "../features/nutritionPlanner/NutritionPlanner";
import MealPlanner from "../features/mealPlanner/MealPlanner";
import IngredientPicker from "../features/ingredientPicker/IngredientPicker";

import AdminApproval from "../features/admin/components/AdminApproval";
import LoginPage from "../features/auth/components/Login";
import Register from "../features/auth/components/Register";

import RequireAuth from "../features/auth/components/RequireAuth";
import RequireAdmin from "../features/auth/components/RequireAdmin";

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
        <Route path="create-training-plan" element={<TrainingPlanner />} />
        <Route path="create-nutrition-plan" element={<NutritionPlanner />} />
        <Route path="meal-planner" element={<MealPlanner />} />
        <Route
          path="meal-planner/select-ingredients/:mealId"
          element={<IngredientPicker />}
        />
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
