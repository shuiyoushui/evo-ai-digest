import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock supabase
const mockFrom = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import { useRecommendations, useAllRecommendations } from "../useRecommendations";

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

describe("useRecommendations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches enabled recommendations ordered by sort_order", async () => {
    const mockData = [
      { id: "1", name: "DeepSeek V3", tag: "性价比之王", sort_order: 1, enabled: true, created_at: "" },
      { id: "2", name: "GPT-5 Mini", tag: "均衡之选", sort_order: 2, enabled: true, created_at: "" },
    ];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useRecommendations(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].name).toBe("DeepSeek V3");
  });

  it("returns empty array when no data", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useRecommendations(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: new Error("fail") }),
        }),
      }),
    });

    const { result } = renderHook(() => useRecommendations(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useAllRecommendations", () => {
  it("fetches all recommendations without enabled filter", async () => {
    const mockData = [
      { id: "1", name: "DeepSeek V3", tag: "性价比之王", sort_order: 1, enabled: true, created_at: "" },
      { id: "3", name: "Disabled Model", tag: "", sort_order: 3, enabled: false, created_at: "" },
    ];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }),
    });

    const { result } = renderHook(() => useAllRecommendations(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });
});
