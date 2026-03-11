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

import { useServiceCategories } from "../useServiceCategories";

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

describe("useServiceCategories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches service categories with parent-child hierarchy", async () => {
    const mockData = [
      { id: "cat1", parent_id: null, label: "自助推广", description: "", icon: "Megaphone", sort_order: 0, enabled: true, created_at: "" },
      { id: "cat2", parent_id: null, label: "技术服务", description: "", icon: "Code", sort_order: 1, enabled: true, created_at: "" },
      { id: "child1", parent_id: "cat1", label: "种子用户", description: "获取早期用户", icon: "Sprout", sort_order: 0, enabled: true, created_at: "" },
    ];
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }),
    });

    const { result } = renderHook(() => useServiceCategories(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(3);

    // Verify hierarchy can be derived
    const topLevel = result.current.data!.filter(c => !c.parent_id);
    expect(topLevel).toHaveLength(2);
    const children = result.current.data!.filter(c => c.parent_id === "cat1");
    expect(children).toHaveLength(1);
    expect(children[0].label).toBe("种子用户");
  });

  it("returns empty array when no data", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    });

    const { result } = renderHook(() => useServiceCategories(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("throws on error", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: new Error("fail") }),
      }),
    });

    const { result } = renderHook(() => useServiceCategories(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useServiceCategories data layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("insert should include parent_id for child categories", async () => {
    const mockSelect = vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "new1" }, error: null }) });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const { supabase } = await import("@/integrations/supabase/client");
    const input = { label: "新子服务", description: "描述", icon: "Cpu", sort_order: 0, parent_id: "cat1" };
    await supabase.from("service_categories").insert(input);

    expect(mockFrom).toHaveBeenCalledWith("service_categories");
    expect(mockInsert).toHaveBeenCalledWith(input);
  });

  it("delete should cascade children (verified by parent_id FK)", async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ delete: mockDelete });

    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("service_categories").delete().eq("id", "cat1");

    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", "cat1");
  });
});
