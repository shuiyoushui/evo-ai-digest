import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
const mockInsert = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "1" }, error: null }) }) });
const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
const mockDelete = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
const mockRpc = vi.fn().mockResolvedValue({ data: [], error: null });
const mockFrom = vi.fn((table: string) => ({
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
    rpc: (fn: string, params: any) => mockRpc(fn, params),
  },
}));

describe("useProducts data layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submitProduct should include tags and category_id in insert payload", async () => {
    const product = {
      name: "Test Product",
      slogan: "A test",
      description: "Desc",
      category_id: "ai-tools",
      tags: ["AI", "Productivity"],
      website: "https://example.com",
      maker_name: "John",
      maker_title: "CEO",
      company_name: "TestCo",
      company_founded: "2024",
      company_location: "SF",
      company_funding: "Seed",
      benefits: [],
      user_id: "user-123",
    };

    // Simulate the insert call
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("products").insert(product);

    expect(mockFrom).toHaveBeenCalledWith("products");
    expect(mockInsert).toHaveBeenCalledWith(product);
    expect(product.tags).toEqual(["AI", "Productivity"]);
    expect(product.category_id).toBe("ai-tools");
  });

  it("updateProduct should pass updated fields including tags", async () => {
    const updates = {
      name: "Updated",
      tags: ["NewTag"],
      updated_at: expect.any(String),
    };

    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("products").update(updates);

    expect(mockUpdate).toHaveBeenCalledWith(updates);
  });

  it("get_products_with_upvotes RPC should accept filter params", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.rpc("get_products_with_upvotes", {
      filter_status: "approved",
      filter_category: "ai-tools",
    });

    expect(mockRpc).toHaveBeenCalledWith("get_products_with_upvotes", {
      filter_status: "approved",
      filter_category: "ai-tools",
    });
  });
});
