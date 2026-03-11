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

import { useDisplayModules } from "../useDisplayModules";

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

describe("useDisplayModules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches display modules ordered by sort_order", async () => {
    const mockData = [
      { id: "video", label: "演示视频", description: "显示演示视频", enabled: false, sort_order: 1 },
      { id: "benefits", label: "核心优势", description: "显示核心优势", enabled: true, sort_order: 2 },
      { id: "skills", label: "技能 & Prompts", description: "显示技能", enabled: true, sort_order: 3 },
    ];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }),
    });

    const { result } = renderHook(() => useDisplayModules(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(3);
    expect(result.current.data![0].id).toBe("video");
    expect(result.current.data![0].enabled).toBe(false);
    expect(result.current.data![1].enabled).toBe(true);
  });

  it("returns empty array when no data", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    const { result } = renderHook(() => useDisplayModules(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: new Error("fail") }),
      }),
    });

    const { result } = renderHook(() => useDisplayModules(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useDisplayModules data layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("update should toggle enabled status", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("display_modules").update({ enabled: true }).eq("id", "video");

    expect(mockFrom).toHaveBeenCalledWith("display_modules");
    expect(mockUpdate).toHaveBeenCalledWith({ enabled: true });
    expect(mockEq).toHaveBeenCalledWith("id", "video");
  });
});
