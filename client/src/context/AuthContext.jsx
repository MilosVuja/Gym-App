import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);

    if (!token) {
      setLoading(false);
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("Set axios default Authorization header");

    axios
      .get("/api/v1/members/me")
      .then((res) => {
        const memberData = res?.data?.data?.member;
        if (memberData) {
          setMember(memberData);
        } else {
          console.error("No member data in response:", res.data);
          setMember(null);
          localStorage.removeItem("token");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch member:", err);
        setMember(null);
        localStorage.removeItem("token");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ member, setMember, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
