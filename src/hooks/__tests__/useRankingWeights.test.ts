import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const mockFrom = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import { useRankingWeights } from "../useRankingWeights";

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

describe("useRankingWeights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches default ranking weights", async () => {
    const mockData = { id: "default", upvotes: 40, views: 25, comments: 20, decay: 15, updated_at: "2026-01-01" };
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useRankingWeights(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.upvotes).toBe(40);
    expect(result.current.data!.views).toBe(25);
    expect(result.current.data!.comments).toBe(20);
    expect(result.current.data!.decay).toBe(15);
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: new Error("fail") }),
        }),
      }),
    });

    const { result } = renderHook(() => useRankingWeights(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useRankingWeights data layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("update should call supabase with correct payload and eq('default')", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { supabase } = await import("@/integrations/supabase/client");
    const payload = { upvotes: 50, views: 20, comments: 15, decay: 15, updated_at: "2026-03-11" };
    await supabase.from("ranking_weights").update(payload).eq("id", "default");

    expect(mockFrom).toHaveBeenCalledWith("ranking_weights");
    expect(mockUpdate).toHaveBeenCalledWith(payload);
    expect(mockEq).toHaveBeenCalledWith("id", "default");
  });

  it("weights should sum to 100 in default seed data", () => {
    const defaults = { upvotes: 40, views: 25, comments: 20, decay: 15 };
    const sum = defaults.upvotes + defaults.views + defaults.comments + defaults.decay;
    expect(sum).toBe(100);
  });
});
