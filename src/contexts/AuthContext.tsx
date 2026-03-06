import { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  id: string;
  nickname: string;
  phone: string;
  email: string;
  avatar: string;
  csdnBound: boolean;
  csdnUsername?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (phone: string, password: string) => void;
  register: (phone: string, password: string, nickname: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  bindCSDN: (username: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (phone: string, _password: string) => {
    setUser({
      id: "u1",
      nickname: "AI探索者",
      phone,
      email: "",
      avatar: "",
      csdnBound: false,
    });
  };

  const register = (phone: string, _password: string, nickname: string) => {
    setUser({
      id: "u" + Date.now(),
      nickname,
      phone,
      email: "",
      avatar: "",
      csdnBound: false,
    });
  };

  const logout = () => setUser(null);

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const bindCSDN = (username: string) => {
    setUser((prev) => (prev ? { ...prev, csdnBound: true, csdnUsername: username } : null));
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, register, logout, updateUser, bindCSDN }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
