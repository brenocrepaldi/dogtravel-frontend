export const SIZE_LABEL: Record<string, string> = {
  small: "Porte Pequeno",
  medium: "Porte Médio",
  large: "Porte Grande",
  giant: "Porte Gigante",
};

export const SIZE_COLOR: Record<string, string> = {
  small:  "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  medium: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  large:  "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  giant:  "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

export const GENDER_LABEL: Record<string, string> = { male: "Macho", female: "Fêmea" };

export const CLIENT_GRADIENTS = [
  "from-violet-400/30 to-purple-500/30",
  "from-sky-400/30 to-blue-500/30",
  "from-emerald-400/30 to-teal-500/30",
  "from-rose-400/30 to-pink-500/30",
  "from-amber-400/30 to-orange-500/30",
  "from-indigo-400/30 to-violet-500/30",
];

export function clientGradient(name: string) {
  return CLIENT_GRADIENTS[name.charCodeAt(0) % CLIENT_GRADIENTS.length];
}

export function clientInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function memberSinceLabel(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}
