"use client";
import React, { createContext, ReactNode } from "react";
import { SessionType } from "../query/users";
import { useSession } from "../query/users";

import { setCookie } from "cookies-next";
import { addDays } from "date-fns";

// Define the shape of the context state
interface AuthContextType {
  data: SessionType | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Create the context with an initial value
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Provide context
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useSession();

  const logout = () => {
    setCookie("token", undefined, { expires: new Date(0) });
  };
  const login = (token: string) => {
    setCookie("token", token, { expires: addDays(new Date(), 7), path: "/" });
  };

  const session = data?.data ?? (data?.data || null);

  return (
    <AuthContext.Provider value={{ data: session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
