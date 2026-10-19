import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useWalkerReviews } from "@/features/walkers/hooks/use-walkers";
import { WalkerReviewsSection } from "./walker-reviews-section";

vi.mock("@/features/walkers/hooks/use-walkers", () => ({ useWalkerReviews: vi.fn() }));

function mockReviews(result: { data?: unknown[]; isLoading?: boolean; isError?: boolean }) {
  vi.mocked(useWalkerReviews).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...result,
  } as unknown as ReturnType<typeof useWalkerReviews>);
}

describe("WalkerReviewsSection", () => {
  it("tells the client there are no reviews yet instead of hiding the section", () => {
    mockReviews({ data: [] });

    render(<WalkerReviewsSection walkerId="w1" />);

    expect(screen.getByText("Avaliações dos clientes")).toBeInTheDocument();
    expect(screen.getByText(/Ainda sem avaliações/)).toBeInTheDocument();
  });

  it("renders nothing when the reviews fail to load", () => {
    mockReviews({ isError: true });

    const { container } = render(<WalkerReviewsSection walkerId="w1" />);

    expect(container).toBeEmptyDOMElement();
  });
});
