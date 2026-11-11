import { describe, expect, it, vi } from "vitest";
import { scrollToTopOf } from "./scroll";

function scrollable(overflowY: string, scrollTop: number) {
  const el = document.createElement("div");
  el.style.overflowY = overflowY;
  // jsdom doesn't lay out, so give scrollTop a plain writable value
  Object.defineProperty(el, "scrollTop", { value: scrollTop, writable: true });
  return el;
}

describe("scrollToTopOf", () => {
  it("resets every scrollable ancestor and the window, leaving the rest alone", () => {
    const outer = scrollable("auto", 300);
    const plain = scrollable("visible", 50);
    const inner = scrollable("scroll", 120);
    const target = document.createElement("div");
    outer.append(plain);
    plain.append(inner);
    inner.append(target);
    document.body.append(outer);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    scrollToTopOf(target);

    expect(outer.scrollTop).toBe(0);
    expect(inner.scrollTop).toBe(0);
    expect(plain.scrollTop).toBe(50);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
  });
});
