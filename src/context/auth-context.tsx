// ============================================================================
// 📁 Hardware Source: src/context/auth-context.tsx
// 🕒 Date: 2025-11-30
// 🧠 Version: v1.2 (Role & Agent State)
// ----------------------------------------------------------------------------
// ✅ Logic:
// - Provides global auth state (user, tier, role, unlocked agents).
// - Handles Google login/logout and refresh helpers.
// - Exposes isAdmin flag for protected admin routes.
// ============================================================================

"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserService, UserTier, UserRole } from "@/lib/user-service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userTier: UserTier | null;
  userRole: UserRole;
  isAdmin: boolean;
  unlockedAgents: string[];
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserTier: () => Promise<void>;
  refreshUnlockedAgents: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userTier, setUserTier] = useState<UserTier | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [unlockedAgents, setUnlockedAgents] = useState<string[]>(["navigator"]);
  const [loading, setLoading] = useState(true);

  const loadUserTier = async (currentUser: User) => {
    try {
      const profile = await UserService.getUserProfile(currentUser.uid, currentUser.email || "");
      setUserTier(profile.tier);
      setUnlockedAgents(profile.unlockedAgents);
      setUserRole(profile.role || "user");
    } catch (error) {
      console.error("Failed to load user tier:", error);
      setUserTier("SCOUT"); // Default to SCOUT on error
      setUnlockedAgents(["navigator"]);
      setUserRole("user");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        console.log("✅ User Active:", currentUser.email);
        await loadUserTier(currentUser);
      } else {
        console.log("💤 User Disconnected");
        setUserTier(null);
        setUnlockedAgents(["navigator"]);
        setUserRole("user");
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Failed:", error);
      alert("Login failed. Check console for details.");
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshUserTier = async () => {
    if (user) {
      await loadUserTier(user);
    }
  };

  const refreshUnlockedAgents = async () => {
    if (user) {
      const agents = await UserService.getUnlockedAgents(user.uid);
      setUnlockedAgents(agents);
    }
  };

  const refreshUserRole = async () => {
    if (user) {
      const profile = await UserService.getUserProfile(user.uid, user.email || "");
      setUserRole(profile.role || "user");
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      userTier,
      userRole,
      isAdmin: userRole === "admin",
      unlockedAgents,
      loginWithGoogle,
      logout,
      refreshUserTier,
      refreshUnlockedAgents,
      refreshUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
