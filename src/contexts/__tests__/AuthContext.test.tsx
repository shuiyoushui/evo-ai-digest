import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { ReactNode } from "react";

const mockSignIn = vi.fn().mockResolvedValue({ error: null });
const mockSignUp = vi.fn().mockResolvedValue({ error: null });
const mockSignOut = vi.fn().mockResolvedValue({});
const mockGetSession = vi.fn().mockResolvedValue({ data: { session: null } });
const mockOnAuthStateChange = vi.fn().mockReturnValue({
  data: { subscription: { unsubscribe: vi.fn() } },
});
const mockSignInWithOtp = vi.fn().mockResolvedValue({ error: null });
const mockVerifyOtp = vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
const mockUpdateUser = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => mockSignIn(...args),
      signUp: (...args: any[]) => mockSignUp(...args),
      signOut: () => mockSignOut(),
      getSession: () => mockGetSession(),
      onAuthStateChange: (...args: any[]) => mockOnAuthStateChange(...args),
      signInWithOtp: (...args: any[]) => mockSignInWithOtp(...args),
      verifyOtp: (...args: any[]) => mockVerifyOtp(...args),
      updateUser: (...args: any[]) => mockUpdateUser(...args),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext", () => {
  it("provides initial unauthenticated state", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });

  it("login calls signInWithPassword", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.login("test@test.com", "password123");
    expect(mockSignIn).toHaveBeenCalledWith({ email: "test@test.com", password: "password123" });
  });

  it("register calls signUp with nickname metadata", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.register("test@test.com", "password123", "TestUser");
    expect(mockSignUp).toHaveBeenCalledWith({
      email: "test@test.com", password: "password123",
      options: { data: { nickname: "TestUser" } },
    });
  });

  it("sendOtp calls signInWithOtp", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.sendOtp("test@test.com");
    expect(mockSignInWithOtp).toHaveBeenCalledWith({ email: "test@test.com" });
  });

  it("verifyOtp calls auth.verifyOtp with email type", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.verifyOtp("test@test.com", "123456");
    expect(mockVerifyOtp).toHaveBeenCalledWith({ email: "test@test.com", token: "123456", type: "email" });
  });

  it("loginWithOtp calls auth.verifyOtp", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.loginWithOtp("test@test.com", "123456");
    expect(mockVerifyOtp).toHaveBeenCalledWith({ email: "test@test.com", token: "123456", type: "email" });
  });

  it("logout calls signOut and clears state", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.logout();
    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });

  it("loginWithPhone calls signInWithPassword with phone-email", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.loginWithPhone("13800138000", "password123");
    expect(mockSignIn).toHaveBeenCalledWith({ email: "13800138000@phone.agenthunt.local", password: "password123" });
  });

  it("registerWithPhone calls signUp with phone-email and metadata", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.registerWithPhone("TestUser", "13800138000", "password123");
    expect(mockSignUp).toHaveBeenCalledWith({
      email: "13800138000@phone.agenthunt.local",
      password: "password123",
      options: { data: { nickname: "TestUser", phone: "13800138000" } },
    });
  });

  it("throws error when useAuth is used outside AuthProvider", () => {
    expect(() => { renderHook(() => useAuth()); }).toThrow("useAuth must be used within AuthProvider");
  });
});
