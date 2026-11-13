import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WalkRequestStatusBanner } from "./walk-request-status-banner";
import type { WalkRecord } from "@/types";

const openMutate = vi.fn();
const cancelMutate = vi.fn();

vi.mock("@/features/walks/hooks/use-walk-actions", () => ({
  useOpenWalk: () => ({ mutate: openMutate, isPending: false }),
  useCancelWalk: () => ({ mutate: cancelMutate, isPending: false }),
}));

const walk = (overrides: Partial<WalkRecord>) =>
  ({ id: "walk-1", status: "pending", requestMode: "directed", ...overrides }) as WalkRecord;

describe("WalkRequestStatusBanner", () => {
  beforeEach(() => {
    openMutate.mockReset();
    cancelMutate.mockReset();
  });

  it("says who has a directed request", () => {
    render(<WalkRequestStatusBanner walk={walk({})} walkerName="Mariana Souza" />);

    expect(screen.getByText("Aguardando Mariana Souza responder")).toBeInTheDocument();
  });

  it("hands a declined request back to the client: open it to all, or cancel after confirming", async () => {
    render(<WalkRequestStatusBanner walk={walk({ requestMode: "declined" })} walkerName="Mariana Souza" />);

    expect(screen.getByText("Mariana Souza não pode fazer este passeio")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Abrir para todos" }));
    expect(openMutate).toHaveBeenCalledWith("walk-1", expect.anything());

    await userEvent.click(screen.getByRole("button", { name: "Cancelar pedido" }));
    expect(cancelMutate).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Sim, cancelar" }));
    expect(cancelMutate).toHaveBeenCalledWith("walk-1", expect.anything());
  });

  it("renders nothing for an open request or a walk that left pending", () => {
    const { container, rerender } = render(
      <WalkRequestStatusBanner walk={walk({ requestMode: "open" })} walkerName={null} />,
    );
    expect(container).toBeEmptyDOMElement();
    rerender(<WalkRequestStatusBanner walk={walk({ status: "accepted", requestMode: null })} walkerName={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
