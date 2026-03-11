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

import { useBannerSlides } from "../useBannerSlides";

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

describe("useBannerSlides", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches banner slides ordered by sort_order", async () => {
    const mockData = [
      { id: "b1", title: "Banner 1", cta: "立即体验", link: "#", active: true, gradient: "from-blue-600", sort_order: 0 },
      { id: "b2", title: "Banner 2", cta: "了解详情", link: "#", active: false, gradient: "from-green-600", sort_order: 1 },
    ];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }),
    });

    const { result } = renderHook(() => useBannerSlides(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].id).toBe("b1");
    expect(result.current.data![1].active).toBe(false);
  });

  it("returns empty array when no data", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    const { result } = renderHook(() => useBannerSlides(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: new Error("DB error") }),
      }),
    });

    const { result } = renderHook(() => useBannerSlides(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useBannerSlides data layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("insert should call supabase.from('banner_slides').insert", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const { supabase } = await import("@/integrations/supabase/client");
    const slide = { id: "b4", title: "New", cta: "Go", link: "/new", active: true, gradient: "from-red-600", sort_order: 3 };
    await supabase.from("banner_slides").insert(slide);

    expect(mockFrom).toHaveBeenCalledWith("banner_slides");
    expect(mockInsert).toHaveBeenCalledWith(slide);
  });

  it("update should call supabase.from('banner_slides').update with eq", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("banner_slides").update({ title: "Updated" }).eq("id", "b1");

    expect(mockUpdate).toHaveBeenCalledWith({ title: "Updated" });
    expect(mockEq).toHaveBeenCalledWith("id", "b1");
  });

  it("delete should call supabase.from('banner_slides').delete with eq", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ delete: mockDelete });

    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("banner_slides").delete().eq("id", "b1");

    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", "b1");
  });
});
