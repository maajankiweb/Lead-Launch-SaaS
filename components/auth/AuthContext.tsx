"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "FREELANCER" | "AGENCY" | "ADMIN" | string;
  plan: "FREE" | "PRO" | "AGENCY_SCALE" | string;
  agencyName?: string | null;
  agencyLogo?: string | null;
  createdAt?: string;
  _count?: {
    campaigns: number;
    deals: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  demoLogin: (role?: "FREELANCER" | "AGENCY") => Promise<boolean>;
  signup: (data: { name: string; email: string; password: string; role?: string; agencyName?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const parseJsonResponse = async (res: Response) => {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return null;
  };

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await parseJsonResponse(res);
      if (data?.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) {
        toast.error(data?.error || `Login failed (${res.status})`);
        return false;
      }
      if (data?.user) {
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
      return false;
    }
  };

  const demoLogin = async (role: "FREELANCER" | "AGENCY" = "FREELANCER"): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) {
        toast.error(data?.error || `Failed to start demo (${res.status})`);
        return false;
      }
      if (data?.user) {
        setUser(data.user);
        toast.success(`Logged in as ${role === "AGENCY" ? "Agency Demo" : "Freelancer Demo"}!`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || "Demo login failed");
      return false;
    }
  };

  const signup = async (formData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    agencyName?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) {
        toast.error(data?.error || `Registration failed (${res.status})`);
        return false;
      }
      if (data?.user) {
        setUser(data.user);
        toast.success("Account created successfully!");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || "Registration error");
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      toast.info("Logged out successfully");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        demoLogin,
        signup,
        logout,
        refreshUser,
      }}
    >
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
