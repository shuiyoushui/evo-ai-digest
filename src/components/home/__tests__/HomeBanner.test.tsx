import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeBanner } from "../HomeBanner";
import type { BannerSlide } from "@/hooks/useBannerSlides";

// Mock embla-carousel-react
vi.mock("embla-carousel-react", () => ({
  default: vi.fn().mockReturnValue([
    vi.fn(),
    {
      on: vi.fn(),
      off: vi.fn(),
      selectedScrollSnap: vi.fn().mockReturnValue(0),
      scrollTo: vi.fn(),
      scrollNext: vi.fn(),
      scrollPrev: vi.fn(),
      canScrollPrev: vi.fn().mockReturnValue(false),
      canScrollNext: vi.fn().mockReturnValue(true),
    },
  ]),
}));

const mockSlides: BannerSlide[] = [
  { id: "b1", title: "测试 Banner 1", cta: "立即体验", link: "#", active: true, gradient: "from-blue-600/90 via-indigo-600/80 to-violet-700/90", sort_order: 0 },
  { id: "b2", title: "测试 Banner 2", cta: "了解详情", link: "#", active: false, gradient: "from-green-600/90 via-teal-600/80 to-cyan-700/90", sort_order: 1 },
  { id: "b3", title: "测试 Banner 3", cta: "查看推荐", link: "#", active: true, gradient: "from-amber-600/90 via-orange-600/80 to-rose-700/90", sort_order: 2 },
];

describe("HomeBanner", () => {
  it("renders nothing when no slides provided", () => {
    const { container } = render(<HomeBanner slides={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when all slides are inactive", () => {
    const inactiveSlides = mockSlides.map(s => ({ ...s, active: false }));
    const { container } = render(<HomeBanner slides={inactiveSlides} />);
    expect(container.firstChild).toBeNull();
  });

  it("only renders active slides", () => {
    render(<HomeBanner slides={mockSlides} />);
    expect(screen.getByText("测试 Banner 1")).toBeInTheDocument();
    expect(screen.queryByText("测试 Banner 2")).not.toBeInTheDocument(); // inactive
    expect(screen.getByText("测试 Banner 3")).toBeInTheDocument();
  });

  it("renders CTA buttons for active slides", () => {
    render(<HomeBanner slides={mockSlides} />);
    expect(screen.getByText("立即体验")).toBeInTheDocument();
    expect(screen.getByText("查看推荐")).toBeInTheDocument();
  });

  it("shows skeleton when loading", () => {
    const { container } = render(<HomeBanner slides={[]} isLoading={true} />);
    // Skeleton renders a div with animate-pulse class
    const skeleton = container.querySelector('[class*="animate-pulse"]');
    expect(skeleton).toBeInTheDocument();
  });

  it("renders with default empty slides prop", () => {
    const { container } = render(<HomeBanner />);
    expect(container.firstChild).toBeNull();
  });
});
