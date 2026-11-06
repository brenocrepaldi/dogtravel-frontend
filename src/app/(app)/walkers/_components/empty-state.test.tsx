import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Search } from "lucide-react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders a button that calls onAction when no href is given", async () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        icon={Search}
        title="Nenhum passeador encontrado"
        description="Ajuste os filtros."
        actionLabel="Limpar filtros"
        onAction={onAction}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));

    expect(onAction).toHaveBeenCalledOnce();
  });

  it("keeps rendering a link when actionHref is given", () => {
    render(
      <EmptyState
        icon={Search}
        title="Nenhum cão"
        description="Cadastre um cão."
        actionLabel="Cadastrar"
        actionHref="/dogs"
      />,
    );

    expect(screen.getByRole("link", { name: "Cadastrar" })).toHaveAttribute("href", "/dogs");
  });
});
