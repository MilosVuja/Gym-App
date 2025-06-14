import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedMember = JSON.parse(localStorage.getItem("member"));
    if (storedMember) {
      setMember(storedMember);    }
    setLoading(false);
  }, []);

  const login = (memberData) => {
    setMember(memberData);
    localStorage.setItem("member", JSON.stringify(memberData));
  };

  const logout = () => {
    setMember(null);
    localStorage.removeItem("member");
  };

  return (
    <AuthContext.Provider value={{ member, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
