import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WalkListAvatar } from "./walk-list-avatar";

const walker = { name: "João Pedro", photoUrl: "https://example.com/joao.jpg", kind: "person" as const };
const dog = (name: string) => ({ name, photoUrl: `https://example.com/${name}.jpg`, kind: "dog" as const });

describe("WalkListAvatar", () => {
  it("shows every dog of a two-dog walk in the corner", () => {
    render(<WalkListAvatar main={walker} corner={[dog("Rex"), dog("Mel")]} />);

    expect(screen.getByAltText("Rex")).toBeInTheDocument();
    expect(screen.getByAltText("Mel")).toBeInTheDocument();
  });

  it("collapses a third dog onward into a count", () => {
    render(<WalkListAvatar main={walker} corner={[dog("Rex"), dog("Mel"), dog("Bob")]} />);

    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.queryByAltText("Mel")).not.toBeInTheDocument();
  });

  it("splits the main tile between two dogs", () => {
    render(<WalkListAvatar main={[dog("Rex"), dog("Mel")]} corner={walker} />);

    expect(screen.getByAltText("Rex")).toBeInTheDocument();
    expect(screen.getByAltText("Mel")).toBeInTheDocument();
    expect(screen.getByAltText("João Pedro")).toBeInTheDocument();
  });
});
