import React, { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { User } from "../types";
import { authAPI } from "../services/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("health_app_current_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const res = await authAPI.login(email, password);

    if (!res?.success || !res.user) {
      console.error("Login failed:", res);
      return false;
    }

    localStorage.setItem("health_app_current_user", JSON.stringify(res.user));
    setUser(res.user); // res.user now guaranteed to exist

    // ✅ After login, fetch push token (web or mobile)
    setTimeout(() => {
      window.dispatchEvent(new Event("save-push-token"));
    }, 500);
    
    return true;
  } catch (error: any) {
    console.error("Login error:", error);
    return false;
  }
};

  const logout = () => {
    localStorage.removeItem("health_app_current_user");
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem("health_app_current_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
