import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DogsApi } from "../api/dogs.api";
import type { Pet } from "@/types";

export function useDogs() {
  return useQuery({
    queryKey: ["dogs"],
    queryFn: DogsApi.list,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAddDog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pet: Omit<Pet, "id">) => DogsApi.create(pet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dogs"] });
    },
  });
}

export function useUpdateDog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Pet, "id">> }) =>
      DogsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dogs"] });
    },
  });
}

export function useRemoveDog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DogsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dogs"] });
    },
  });
}
