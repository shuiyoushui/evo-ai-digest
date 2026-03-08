import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "../ProductCard";
import type { DbProduct } from "@/hooks/useProducts";

// Mock dependencies
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, isLoggedIn: false }),
}));

vi.mock("@/hooks/useUpvotes", () => ({
  useToggleUpvote: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const baseProduct: DbProduct = {
  id: "1",
  name: "TestAI",
  slogan: "AI for testing",
  description: "A test product",
  logo_url: "",
  category_id: "ai",
  tags: ["Tag1", "Tag2", "Tag3", "Tag4"],
  website: "https://test.com",
  video_url: "",
  verified: true,
  featured: false,
  status: "approved",
  maker_name: "Maker",
  maker_title: "CEO",
  maker_avatar: "",
  company_name: "Co",
  company_founded: "2024",
  company_location: "SF",
  company_funding: "Seed",
  benefits: [],
  views: 100,
  user_id: "u1",
  launch_date: "2024-01-01",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  upvote_count: 42,
};

describe("ProductCard", () => {
  it("renders product name and slogan", () => {
    render(<ProductCard product={baseProduct} rank={1} onClick={vi.fn()} isUpvoted={false} />);
    expect(screen.getByText("TestAI")).toBeInTheDocument();
    expect(screen.getByText("AI for testing")).toBeInTheDocument();
  });

  it("renders at most 3 tags", () => {
    render(<ProductCard product={baseProduct} rank={1} onClick={vi.fn()} isUpvoted={false} />);
    expect(screen.getByText("Tag1")).toBeInTheDocument();
    expect(screen.getByText("Tag2")).toBeInTheDocument();
    expect(screen.getByText("Tag3")).toBeInTheDocument();
    expect(screen.queryByText("Tag4")).not.toBeInTheDocument();
  });

  it("displays upvote count", () => {
    render(<ProductCard product={baseProduct} rank={1} onClick={vi.fn()} isUpvoted={false} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows error toast when unauthenticated user clicks upvote", async () => {
    const { toast } = await import("sonner");
    render(<ProductCard product={baseProduct} rank={1} onClick={vi.fn()} isUpvoted={false} />);
    const upvoteButton = screen.getByText("42").closest("button")!;
    fireEvent.click(upvoteButton);
    expect(toast.error).toHaveBeenCalledWith("请先登录后再投票");
  });

  it("applies gold rank class for rank 1", () => {
    const { container } = render(<ProductCard product={baseProduct} rank={1} onClick={vi.fn()} isUpvoted={false} />);
    const rankSpan = container.querySelector(".rank-gold");
    expect(rankSpan).toBeInTheDocument();
  });

  it("shows verified badge when product is verified", () => {
    render(<ProductCard product={baseProduct} rank={1} onClick={vi.fn()} isUpvoted={false} />);
    expect(screen.getByText("✓")).toBeInTheDocument();
  });
});
