import type { DogSize } from "@/types";

export const DOG_SIZE_LABEL: Record<DogSize, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
  giant: "Gigante",
};

export const DOG_SIZE_TEXT_OPTIONS: Array<{ value: DogSize; label: string }> = [
  { value: "small", label: "Pequeno (até 10kg)" },
  { value: "medium", label: "Médio (11kg a 25kg)" },
  { value: "large", label: "Grande (26kg a 40kg)" },
  { value: "giant", label: "Gigante (acima de 40kg)" },
];

export function petEmojiBySize(size: DogSize) {
  if (size === "small") return "🐩";
  if (size === "medium") return "🐕";
  if (size === "large") return "🦮";
  return "🐕‍🦺";
}
