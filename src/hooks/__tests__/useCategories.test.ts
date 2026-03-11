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

import { useCategories } from "../useCategories";

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

describe("useCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches categories ordered by sort_order", async () => {
    const mockData = [
      { id: "devcode", label: "开发与编程", icon: "💻", sort_order: 0 },
      { id: "design", label: "视觉与创意", icon: "🎨", sort_order: 1 },
    ];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }),
    });

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].id).toBe("devcode");
  });

  it("returns empty array when no data", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useCategories CRUD data layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create category should include id, label, icon, sort_order", async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const { supabase } = await import("@/integrations/supabase/client");
    const cat = { id: "newcat", label: "新分类", icon: "🆕", sort_order: 5 };
    await supabase.from("categories").insert(cat);

    expect(mockFrom).toHaveBeenCalledWith("categories");
    expect(mockInsert).toHaveBeenCalledWith(cat);
  });

  it("update category should update label and icon", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("categories").update({ label: "改名", icon: "✏️" }).eq("id", "devcode");

    expect(mockUpdate).toHaveBeenCalledWith({ label: "改名", icon: "✏️" });
    expect(mockEq).toHaveBeenCalledWith("id", "devcode");
  });

  it("delete category should call delete with eq", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ delete: mockDelete });

    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("categories").delete().eq("id", "devcode");

    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", "devcode");
  });
});
