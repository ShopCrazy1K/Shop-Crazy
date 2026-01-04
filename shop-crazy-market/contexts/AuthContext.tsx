"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  username: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username?: string, referralCode?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session - only in browser
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // Validate user object structure
            if (parsedUser && parsedUser.id && parsedUser.email) {
              setUser(parsedUser);
            } else {
              localStorage.removeItem("user");
            }
          } catch (error) {
            console.error("Error parsing stored user:", error);
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let error: any;
        try {
          error = await response.json();
        } catch {
          error = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();
      if (data.user && data.user.id && data.user.email) {
        setUser(data.user);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem("user", JSON.stringify(data.user));
          } catch (error) {
            console.error("Error saving user to localStorage:", error);
          }
        }
      } else {
        throw new Error("Invalid user data received");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, username?: string, referralCode?: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, referralCode }),
      });

      if (!response.ok) {
        let error: any;
        try {
          error = await response.json();
        } catch {
          error = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(error.error || "Signup failed");
      }

      const data = await response.json();
      if (data.user && data.user.id && data.user.email) {
        setUser(data.user);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem("user", JSON.stringify(data.user));
          } catch (error) {
            console.error("Error saving user to localStorage:", error);
          }
        }
      } else {
        throw new Error("Invalid user data received");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem("user");
      } catch (error) {
        console.error("Error removing user from localStorage:", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

