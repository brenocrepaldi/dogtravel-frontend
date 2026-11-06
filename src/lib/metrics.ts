export interface ProductMetricEvent {
  name:
    | "walkers_filters_applied"
    | "walkers_fit_my_pets_enabled"
    | "walk_request_submitted"
    | "walk_request_failed"
    | "walk_repeat_prefill_used";
  payload?: Record<string, string | number | boolean | null>;
  at: string;
}

const STORAGE_KEY = "dogtravel.product-metrics";

function parseStoredMetrics(raw: string | null) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProductMetricEvent[]) : [];
  } catch {
    return [];
  }
}

export function trackMetricEvent(event: Omit<ProductMetricEvent, "at">) {
  const completeEvent: ProductMetricEvent = {
    ...event,
    at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const previous = window.localStorage.getItem(STORAGE_KEY);
    const parsed = parseStoredMetrics(previous);
    const next = [...parsed, completeEvent].slice(-200);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[metric]", completeEvent.name, completeEvent.payload ?? {});
  }
}
