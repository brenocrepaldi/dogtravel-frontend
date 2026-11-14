import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WalkerInviteBanner } from "./walker-invite-banner";

const walkers = [
  { id: "w1", name: "Mariana Souza", avatarUrl: null, rating: 4.8, reviews: 12, location: "Pinheiros", verified: true },
];

vi.mock("@/features/walkers/hooks/use-walkers", () => ({
  useWalkerById: (id: string) => ({ data: walkers.find((w) => w.id === id), isLoading: false }),
}));

describe("WalkerInviteBanner", () => {
  it("invites the client to pick a walker on the walkers page, parking the draft first", async () => {
    const onBeforePick = vi.fn();
    render(<WalkerInviteBanner selectedWalkerId={null} onBeforePick={onBeforePick} onClear={vi.fn()} />);

    const link = screen.getByRole("link", { name: /Escolher um específico/ });
    expect(link).toHaveAttribute("href", "/walkers?pick=1");
    expect(screen.getByText("Qualquer passeador disponível pode aceitar.")).toBeInTheDocument();

    await userEvent.click(link);
    expect(onBeforePick).toHaveBeenCalledOnce();
  });

  it("shows the chosen walker, who can be changed or dropped", async () => {
    const onClear = vi.fn();
    render(<WalkerInviteBanner selectedWalkerId="w1" onBeforePick={vi.fn()} onClear={onClear} />);

    expect(screen.getByText("Mariana Souza")).toBeInTheDocument();
    expect(screen.getByText("Só Mariana recebe o pedido.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Trocar" })).toHaveAttribute("href", "/walkers?pick=1");

    await userEvent.click(screen.getByRole("button", { name: "Abrir para todos" }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
