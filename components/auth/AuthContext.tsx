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
      const loginTimeStr = typeof window !== "undefined" ? localStorage.getItem("l2l_login_time") : null;
      if (loginTimeStr) {
        const loginTime = parseInt(loginTimeStr, 10);
        // Force re-login after 24 hours (86,400,000 ms)
        if (Date.now() - loginTime > 24 * 60 * 60 * 1000) {
          localStorage.removeItem("l2l_login_time");
          await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
          setUser(null);
          setLoading(false);
          toast.info("Your 24-hour session has expired. Please log in again.");
          return;
        }
      }

      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await parseJsonResponse(res);
      if (data?.authenticated && data.user) {
        setUser(data.user);
        if (!loginTimeStr && typeof window !== "undefined") {
          localStorage.setItem("l2l_login_time", String(Date.now()));
        }
      } else {
        setUser(null);
        if (typeof window !== "undefined") localStorage.removeItem("l2l_login_time");
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
        if (typeof window !== "undefined") {
          localStorage.setItem("l2l_login_time", String(Date.now()));
        }
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
        if (typeof window !== "undefined") {
          localStorage.setItem("l2l_login_time", String(Date.now()));
        }
        toast.success(`Logged into ${data.user.plan} Demo Workspace!`);
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
        toast.error(data?.error || `Signup failed (${res.status})`);
        return false;
      }
      if (data?.user) {
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("l2l_login_time", String(Date.now()));
        }
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("l2l_login_time");
      }
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
