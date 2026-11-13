import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { WalkerChoice } from "./walker-choice";

const walkers = [
  { id: "w1", name: "Mariana Souza", avatarUrl: null, rating: 4.8, reviews: 12, location: "Pinheiros", verified: true },
  { id: "w2", name: "Thiago Ramos", avatarUrl: null, rating: 4.5, reviews: 3, location: "Moema", verified: false },
];

vi.mock("@/features/walkers/hooks/use-walkers", () => ({
  useWalkers: () => ({ data: walkers, isLoading: false, isError: false, refetch: vi.fn() }),
  useWalkerById: (id: string) => ({ data: walkers.find((w) => w.id === id), isLoading: false }),
}));

function Harness({ initial = null }: { initial?: string | null }) {
  const [walkerId, setWalkerId] = useState<string | null>(initial);
  return (
    <>
      <WalkerChoice selectedWalkerId={walkerId} onChange={setWalkerId} />
      <output data-testid="value">{walkerId ?? "any"}</output>
    </>
  );
}

describe("WalkerChoice", () => {
  it("starts open to every walker", () => {
    render(<Harness />);

    expect(screen.getByRole("button", { name: /Qualquer passeador/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("value")).toHaveTextContent("any");
  });

  it("directs the request at the walker picked in the sheet, and can go back to any walker", async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: /Escolher passeador/ }));
    await userEvent.type(screen.getByRole("searchbox", { name: "Buscar passeador" }), "moema");
    expect(screen.queryByText("Mariana Souza")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: /Thiago Ramos/ }));

    expect(screen.getByTestId("value")).toHaveTextContent("w2");
    expect(screen.getByText(/Só Thiago recebe o pedido/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Qualquer passeador/ }));
    expect(screen.getByTestId("value")).toHaveTextContent("any");
  });

  it("shows a walker preselected from their profile", () => {
    render(<Harness initial="w1" />);

    expect(screen.getByRole("button", { name: /Escolher passeador/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Mariana Souza")).toBeInTheDocument();
  });
});
