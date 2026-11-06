import type {
  WalkRecord,
  WalkRequest,
  WalkRequestDetail,
  UserRole,
  WalkEstimateRequest,
  WalkEstimateResult,
  CreateWalkDto,
} from "@/types";
import api, { isApiConfigured } from "@/services/api";

// The in-memory mock lives in walks.mock.ts and is loaded dynamically so it
// (and mock-data) never reaches the client bundle when a real API is configured.

// ─── Read ─────────────────────────────────────────────────────────────────────

export const WalksApi = {
  list: async (role: UserRole, walkerId?: string): Promise<WalkRecord[]> => {
    if (!isApiConfigured) {
      const { walksMock } = await import("./walks.mock");
      return walksMock.list(role, walkerId);
    }
    const params: Record<string, string> = { role };
    if (role === "walker" && walkerId) params.walkerId = walkerId;
    return api
      .get<WalkRecord[]>("/walks", { params })
      .then((r) => r.data);
  },

  getById: async (id: string): Promise<WalkRecord | undefined> => {
    if (!isApiConfigured) {
      const { walksMock } = await import("./walks.mock");
      return walksMock.getById(id);
    }
    return api.get<WalkRecord>(`/walks/${id}`).then((r) => r.data);
  },

  listRequests: async (): Promise<WalkRequest[]> => {
    if (!isApiConfigured) {
      const { walksMock } = await import("./walks.mock");
      return walksMock.listRequests();
    }
    return api.get<WalkRequest[]>("/walk-requests").then((r) => r.data);
  },

  getRequestById: async (id: string): Promise<WalkRequestDetail> => {
    if (!isApiConfigured) {
      const { walksMock } = await import("./walks.mock");
      return walksMock.getRequestById(id);
    }
    return api.get<WalkRequestDetail>(`/walk-requests/${id}`).then((r) => r.data);
  },

  // Delegates to ReviewsApi — kept here for backwards-compat call sites
  hasReview: async (walkId: string): Promise<boolean> => {
    const { ReviewsApi } = await import("@/features/reviews/api/reviews.api");
    return ReviewsApi.getByWalkId(walkId).then((r) => r !== null);
  },

  // ─── Estimate ───────────────────────────────────────────────────────────────

  estimate: async (input: WalkEstimateRequest): Promise<WalkEstimateResult> => {
    if (!isApiConfigured) {
      const { walksMock } = await import("./walks.mock");
      return walksMock.estimate(input);
    }
    return api
      .post<WalkEstimateResult>("/walks/estimate", input)
      .then((r) => r.data);
  },

  // ─── Mutations ──────────────────────────────────────────────────────────────

  create: async (dto: CreateWalkDto): Promise<WalkRecord> => {
    if (!isApiConfigured) {
      const { walksMock } = await import("./walks.mock");
      return walksMock.create(dto);
    }
    return api.post<WalkRecord>("/walks", dto).then((r) => r.data);
  },

  cancel: async (id: string): Promise<void> => {
    if (!isApiConfigured) {
      const { walksMock } = await import("./walks.mock");
      return walksMock.cancel(id);
    }
    await api.patch(`/walks/${id}/cancel`);
  },

  complete: async (walkId: string, coords?: { lat: number; lng: number }): Promise<WalkRecord> => {
    if (!isApiConfigured) {
      const { walksMock } = await import("./walks.mock");
      return walksMock.complete(walkId);
    }
    return api
      .patch<WalkRecord>(`/walks/${walkId}/complete`, coords ?? {})
      .then((r) => r.data);
  },

  start: async (walkId: string, code: string): Promise<WalkRecord> => {
    if (!isApiConfigured) {
      const { walksMock } = await import("./walks.mock");
      return walksMock.start(walkId, code);
    }
    return api
      .patch<WalkRecord>(`/walks/${walkId}/start`, { code })
      .then((r) => r.data);
  },

  accept: async (request: WalkRequest, walkerName: string, walkerId: string): Promise<WalkRecord> => {
    if (!isApiConfigured) {
      const { walksMock } = await import("./walks.mock");
      return walksMock.accept(request, walkerName, walkerId);
    }
    return api
      .post<WalkRecord>(`/walk-requests/${request.id}/accept`)
      .then((r) => r.data);
  },

  decline: async (requestId: string): Promise<void> => {
    if (!isApiConfigured) {
      const { walksMock } = await import("./walks.mock");
      return walksMock.decline(requestId);
    }
    await api.post(`/walk-requests/${requestId}/decline`);
  },

  report: async (walkId: string, payload: { reason: string; description?: string }): Promise<void> => {
    if (!isApiConfigured) {
      return;
    }
    await api.post(`/walks/${walkId}/report`, payload);
  },
};
