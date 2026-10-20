import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { SessionExpiredNotice } from "./session-expired-notice";

vi.mock("next/navigation", () => ({ useSearchParams: vi.fn() }));

function withQuery(query: string) {
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(query) as unknown as ReturnType<typeof useSearchParams>,
  );
}

describe("SessionExpiredNotice", () => {
  it("tells the user their session expired when sent here for that reason", () => {
    withQuery("callbackUrl=%2Fdashboard&expired=1");

    render(<SessionExpiredNotice />);

    expect(screen.getByRole("status")).toHaveTextContent("Sua sessão expirou. Faça login novamente.");
  });

  it("stays hidden on a regular visit to the login page", () => {
    withQuery("callbackUrl=%2Fdashboard");

    const { container } = render(<SessionExpiredNotice />);

    expect(container).toBeEmptyDOMElement();
  });
});
