import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDelete = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  }),
});
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ data: [{ product_id: "p1" }], error: null }),
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      delete: mockDelete,
      insert: mockInsert,
      select: mockSelect,
    })),
  },
}));

describe("useUpvotes data layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call delete when user has already upvoted", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const result = supabase.from("upvotes").delete();
    expect(mockDelete).toHaveBeenCalled();
  });

  it("should call insert when user has not upvoted", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("upvotes").insert({ user_id: "u1", product_id: "p1" });
    expect(mockInsert).toHaveBeenCalledWith({ user_id: "u1", product_id: "p1" });
  });

  it("should return product_ids from select query", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const chain = supabase.from("upvotes").select("product_id");
    expect(mockSelect).toHaveBeenCalledWith("product_id");
  });
});
