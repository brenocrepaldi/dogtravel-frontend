import { useQuery } from "@tanstack/react-query";
import { ClientsApi } from "../api/clients.api";

export function useClientProfile(clientId: string) {
  return useQuery({
    queryKey: ["client-profile", clientId],
    queryFn: () => ClientsApi.getById(clientId),
    enabled: !!clientId,
    staleTime: 60_000,
  });
}
