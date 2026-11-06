import api, { isApiConfigured } from "@/services/api";
import type { ClientProfile } from "@/types";

export const ClientsApi = {
  getById: async (clientId: string): Promise<ClientProfile> => {
    if (!isApiConfigured) {
      const { clientsMock } = await import("./clients.mock");
      return clientsMock.getById(clientId);
    }
    return api.get<ClientProfile>(`/clients/${clientId}`).then((r) => r.data);
  },
};
