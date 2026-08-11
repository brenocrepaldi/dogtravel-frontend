import {
  DURATION_BASE_PRICE,
  EXTRA_PET_FEE,
  PLATFORM_AND_SAFETY_FEE_RATE,
  FIRST_RIDE_DISCOUNT_RATE,
} from "@/config/pricing";
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

// Module-level mutable stores — lazily populated via dynamic import so
// mock-data.ts never reaches the client bundle when a real API is configured.
let walksStore: WalkRecord[] | null = null;
let walkRequestsStore: WalkRequest[] | null = null;

async function getWalksStore(): Promise<WalkRecord[]> {
  if (!walksStore) {
    const { walks: seedWalks } = await import("@/lib/mock-data");
    walksStore = [...seedWalks];
  }
  return walksStore;
}

async function getWalkRequestsStore(): Promise<WalkRequest[]> {
  if (!walkRequestsStore) {
    const { walkRequests: seedWalkRequests } = await import("@/lib/mock-data");
    walkRequestsStore = [...seedWalkRequests];
  }
  return walkRequestsStore;
}

function randomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export const WalksApi = {
  list: async (role: UserRole, walkerId?: string): Promise<WalkRecord[]> => {
    if (!isApiConfigured) {
      const store = await getWalksStore();
      if (role === "client") {
        return [...store].filter((w) =>
          w.participants.some((p) => p.role === "client" && p.id === "client_1")
        );
      }
      return [...store].filter((w) => w.walkerId === walkerId);
    }
    const params: Record<string, string> = { role };
    if (role === "walker" && walkerId) params.walkerId = walkerId;
    return api
      .get<WalkRecord[]>("/walks", { params })
      .then((r) => r.data);
  },

  getById: async (id: string): Promise<WalkRecord | undefined> => {
    if (!isApiConfigured) {
      const store = await getWalksStore();
      return store.find((w) => w.id === id);
    }
    return api.get<WalkRecord>(`/walks/${id}`).then((r) => r.data);
  },

  listRequests: async (): Promise<WalkRequest[]> => {
    if (!isApiConfigured) {
      return [...(await getWalkRequestsStore())];
    }
    return api.get<WalkRequest[]>("/walk-requests").then((r) => r.data);
  },

  getRequestById: async (id: string): Promise<WalkRequestDetail> => {
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
      const { durationMinutes, petCount, isFirstRide } = input;
      const durationBase         = DURATION_BASE_PRICE[durationMinutes] ?? 18;
      const extraPetFee          = Math.max(0, petCount - 1) * EXTRA_PET_FEE;
      const subtotal             = durationBase + extraPetFee;
      const platformAndSafetyFee = +(subtotal * PLATFORM_AND_SAFETY_FEE_RATE).toFixed(2);
      const totalBeforeDiscount  = subtotal + platformAndSafetyFee;
      const firstRideDiscount    = isFirstRide
        ? +(totalBeforeDiscount * FIRST_RIDE_DISCOUNT_RATE).toFixed(2)
        : 0;
      const total = +(totalBeforeDiscount - firstRideDiscount).toFixed(2);
      return { durationBase, extraPetFee, platformAndSafetyFee, firstRideDiscount, total };
    }
    return api
      .post<WalkEstimateResult>("/walks/estimate", input)
      .then((r) => r.data);
  },

  // ─── Mutations ──────────────────────────────────────────────────────────────

  create: async (dto: CreateWalkDto): Promise<WalkRecord> => {
    if (!isApiConfigured) {
      const [walks, walkRequests] = await Promise.all([getWalksStore(), getWalkRequestsStore()]);
      const dateLabel = new Date(dto.scheduledAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
      const now = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newWalk: WalkRecord = {
        id: `local-${crypto.randomUUID()}`,
        walkerId: dto.walkerId ?? null,
        clientName: "Cliente",
        petIds: dto.petIds,
        petNames: dto.petNames,
        status: "pending",
        dateLabel,
        scheduledAt: dto.scheduledAt,
        durationMinutes: dto.durationMinutes,
        price: dto.price,
        distanceKm: 0,
        startAddress: dto.startAddress,
        startLat: dto.lat,
        startLng: dto.lng,
        notes: dto.notes,
        paymentMethodId: dto.paymentMethodId,
        participants: [],
        timeline: [
          { id: "ev-1", label: "Pedido criado", at: now, state: "done" },
          { id: "ev-2", label: "Aguardando passeador", at: dateLabel, state: "pending" },
        ],
      };
      const newRequest: WalkRequest = {
        id: newWalk.id,
        clientId: "client_1",
        clientName: "Cliente",
        clientAvatarUrl: null,
        petNames: dto.petNames,
        petIds: dto.petIds,
        petPhotos: dto.petIds.map((id) => ({ id, photoUrl: null })),
        durationMinutes: dto.durationMinutes,
        price: dto.price,
        scheduledAt: dto.scheduledAt,
        scheduledLabel: dateLabel,
        startAddress: dto.startAddress,
        receivedMinutes: 0,
      };
      walksStore = [newWalk, ...walks];
      walkRequestsStore = [newRequest, ...walkRequests];
      return newWalk;
    }
    return api.post<WalkRecord>("/walks", dto).then((r) => r.data);
  },

  cancel: async (id: string): Promise<void> => {
    if (!isApiConfigured) {
      const store = await getWalksStore();
      walksStore = store.map((w) =>
        w.id === id ? { ...w, status: "cancelled" as const } : w
      );
      return;
    }
    await api.patch(`/walks/${id}/cancel`);
  },

  complete: async (walkId: string, coords?: { lat: number; lng: number }): Promise<WalkRecord> => {
    if (!isApiConfigured) {
      const store = await getWalksStore();
      const walk = store.find((w) => w.id === walkId);
      if (!walk) throw new Error("WALK_NOT_FOUND");

      const now = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      walksStore = store.map((w) => {
        if (w.id !== walkId) return w;
        return {
          ...w,
          status: "completed" as const,
          timeline: w.timeline.map((t) => ({
            ...t,
            state: "done" as const,
            at: t.state === "pending" ? now : t.at,
          })),
        };
      });

      return walksStore.find((w) => w.id === walkId)!;
    }
    return api
      .patch<WalkRecord>(`/walks/${walkId}/complete`, coords ?? {})
      .then((r) => r.data);
  },

  start: async (walkId: string, code: string): Promise<WalkRecord> => {
    if (!isApiConfigured) {
      const store = await getWalksStore();
      const walk = store.find((w) => w.id === walkId);
      if (!walk) throw new Error("WALK_NOT_FOUND");
      if (walk.startCode !== code) throw new Error("INVALID_CODE");

      const now = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const currentIdx     = walk.timeline.findIndex((t) => t.state === "current");
      const firstPendingIdx = walk.timeline.findIndex((t) => t.state === "pending");

      walksStore = store.map((w) => {
        if (w.id !== walkId) return w;
        return {
          ...w,
          status: "in_progress" as const,
          timeline: w.timeline.map((t, i) => {
            if (i === currentIdx)      return { ...t, state: "done" as const };
            if (i === firstPendingIdx) return { ...t, state: "current" as const, at: now };
            return t;
          }),
        };
      });

      return walksStore.find((w) => w.id === walkId)!;
    }
    return api
      .patch<WalkRecord>(`/walks/${walkId}/start`, { code })
      .then((r) => r.data);
  },

  accept: async (request: WalkRequest, walkerName: string, walkerId: string): Promise<WalkRecord> => {
    if (!isApiConfigured) {
      const [walks, walkRequests] = await Promise.all([getWalksStore(), getWalkRequestsStore()]);
      walkRequestsStore = walkRequests.filter((r) => r.id !== request.id);

      const now = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newWalk: WalkRecord = {
        id: `accepted-${request.id}`,
        walkerId,
        clientName: request.clientName,
        petNames: request.petNames,
        status: "accepted",
        dateLabel: request.scheduledLabel,
        scheduledAt: request.scheduledAt,
        durationMinutes: request.durationMinutes,
        price: request.price,
        distanceKm: 0,
        startAddress: request.startAddress,
        startCode: randomCode(),
        participants: [
          { id: request.clientId, name: request.clientName, role: "client" },
          { id: walkerId, name: walkerName, role: "walker" },
        ],
        timeline: [
          { id: "t1", label: "Pedido aceito", at: now, state: "done" },
          { id: "t2", label: "Aguardando passeio", at: request.scheduledLabel, state: "current" },
          { id: "t3", label: "Passeio em andamento", at: "--", state: "pending" },
          { id: "t4", label: "Passeio concluído", at: "--", state: "pending" },
        ],
      };

      walksStore = [newWalk, ...walks];
      return newWalk;
    }
    return api
      .post<WalkRecord>(`/walk-requests/${request.id}/accept`)
      .then((r) => r.data);
  },

  decline: async (requestId: string): Promise<void> => {
    if (!isApiConfigured) {
      const store = await getWalkRequestsStore();
      walkRequestsStore = store.filter((r) => r.id !== requestId);
      return;
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
