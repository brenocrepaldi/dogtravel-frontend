import {
  DURATION_BASE_PRICE,
  EXTRA_PET_FEE,
  PLATFORM_AND_SAFETY_FEE_RATE,
  FIRST_RIDE_DISCOUNT_RATE,
} from "@/config/pricing";
import { pets, walks as seedWalks, walkRequests as seedWalkRequests } from "@/lib/mock/mock-data";
import type {
  WalkRecord,
  WalkRequest,
  WalkRequestDetail,
  UserRole,
  WalkEstimateRequest,
  WalkEstimateResult,
  CreateWalkDto,
} from "@/types";

// In-memory mock backend, loaded only when no real API is configured
// (see the dynamic imports in walks.api.ts).
let walksStore: WalkRecord[] | null = null;
let walkRequestsStore: WalkRequest[] | null = null;

function getWalksStore(): WalkRecord[] {
  if (!walksStore) {
    walksStore = [...seedWalks];
  }
  return walksStore;
}

function getWalkRequestsStore(): WalkRequest[] {
  if (!walkRequestsStore) {
    walkRequestsStore = [...seedWalkRequests];
  }
  return walkRequestsStore;
}

function randomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export const walksMock = {
  list: async (role: UserRole, walkerId?: string): Promise<WalkRecord[]> => {
    const store = getWalksStore();
    if (role === "client") {
      return [...store].filter((w) =>
        w.participants.some((p) => p.role === "client" && p.id === "client_1")
      );
    }
    return [...store].filter((w) => w.walkerId === walkerId);
  },
  getById: async (id: string): Promise<WalkRecord | undefined> => {
    const store = getWalksStore();
    return store.find((w) => w.id === id);
  },
  listRequests: async (): Promise<WalkRequest[]> => {
    return [...(getWalkRequestsStore())];
  },
  getRequestById: async (id: string): Promise<WalkRequestDetail> => {
    const req = getWalkRequestsStore().find((r) => r.id === id);
    if (!req) throw new Error(`Walk request ${id} not found`);
    const dogs = req.petNames.map((name, i) => {
      const pet = pets.find((p) => p.name === name);
      return {
        id: req.petIds[i] ?? name,
        name,
        breed: pet?.breed ?? "SRD",
        age: pet?.age ?? 2,
        size: pet?.size ?? "medium",
        gender: pet?.gender ?? "male",
        photoUrl: req.petPhotos?.[i]?.photoUrl ?? null,
        notes: pet?.notes ?? null,
      };
    });
    return {
      id: req.id,
      clientId: req.clientId,
      clientName: req.clientName,
      clientAvatarUrl: req.clientAvatarUrl,
      clientMemberSince: "2025-03-10T00:00:00-03:00",
      petNames: req.petNames,
      petIds: req.petIds,
      dogs,
      durationMinutes: req.durationMinutes,
      price: req.price,
      scheduledAt: req.scheduledAt,
      scheduledLabel: req.scheduledLabel,
      startAddress: req.startAddress,
      startLat: -23.5614,
      startLng: -46.6559,
      receivedMinutes: req.receivedMinutes,
    };
  },
  estimate: async (input: WalkEstimateRequest): Promise<WalkEstimateResult> => {
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
  },
  create: async (dto: CreateWalkDto): Promise<WalkRecord> => {
    const [walks, walkRequests] = [getWalksStore(), getWalkRequestsStore()];
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
      requestMode: dto.walkerId ? "directed" : "open",
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
  },
  cancel: async (id: string): Promise<void> => {
    const store = getWalksStore();
    walksStore = store.map((w) =>
      w.id === id ? { ...w, status: "cancelled" as const } : w
    );
    return;
  },
  open: async (id: string): Promise<WalkRecord> => {
    const store = getWalksStore();
    const walk = store.find((w) => w.id === id);
    if (!walk) throw new Error("WALK_NOT_FOUND");
    const opened: WalkRecord = { ...walk, walkerId: null, walkerName: null, requestMode: "open" };
    walksStore = store.map((w) => (w.id === id ? opened : w));
    return opened;
  },
  complete: async (walkId: string): Promise<WalkRecord> => {
    const store = getWalksStore();
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
  },
  start: async (walkId: string, code: string): Promise<WalkRecord> => {
    const store = getWalksStore();
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
  },
  accept: async (request: WalkRequest, walkerName: string, walkerId: string): Promise<WalkRecord> => {
    const [walks, walkRequests] = [getWalksStore(), getWalkRequestsStore()];
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
  },
  decline: async (requestId: string): Promise<void> => {
    const store = getWalkRequestsStore();
    walkRequestsStore = store.filter((r) => r.id !== requestId);
    return;
  },
};
