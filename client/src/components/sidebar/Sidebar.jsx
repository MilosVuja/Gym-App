import React, { useState } from "react";
import {
  FaUser,
  FaRuler,
  FaIdCard,
  FaDumbbell,
  FaAppleAlt,
  FaBullseye,
  FaTrophy,
  FaBars,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Personal Details", icon: <FaUser />, section: "personal" },
  { label: "Measurements", icon: <FaRuler />, section: "measurements" },
  { label: "Memberships", icon: <FaIdCard />, section: "memberships" },
  { label: "Training", icon: <FaDumbbell />, section: "training" },
  { label: "Nutrition", icon: <FaAppleAlt />, section: "nutrition" },
  { label: "Health", icon: <FaAppleAlt />, section: "health" },
  { label: "Goals", icon: <FaBullseye />, section: "goals" },
  { label: "Achievements", icon: <FaTrophy />, section: "achievements" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`${
        collapsed ? "w-[70px]" : "w-[250px]"
      } min-h-screen bg-red-900 text-black font-bold flex flex-col transition-all duration-300 sticky top-0`}
    >
      <div className={`p-3 ${collapsed ? "px-4" : "flex justify-end"}`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="cursor-pointer text-white text-lg flex items-center justify-center"
        >
          <FaBars />
        </button>
      </div>

      <div className={`flex justify-center ${collapsed ? "hidden" : ""}`}>
        <img
          src="/path-to-profile-pic.jpg"
          alt="Profile"
          className="h-20 w-20 rounded-full mb-6"
        />
      </div>

      <ul className="flex-1 list-none p-0">
        {menuItems.map((item) => (
          <li key={item.section}>
            <NavLink
              to={`/members/profile/${item.section}`}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 transition-colors duration-300 ${
                  isActive
                    ? "bg-black text-white"
                    : "hover:bg-black hover:text-white"
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && (
                <span className="ml-3 uppercase">{item.label}</span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
