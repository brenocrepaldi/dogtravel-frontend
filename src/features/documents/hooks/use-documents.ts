import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DocumentsApi } from "../api/documents.api";

const KEY = ["documents"] as const;

export function useDocuments() {
  return useQuery({
    queryKey: KEY,
    queryFn: DocumentsApi.getStatus,
    staleTime: 30_000,
  });
}

export function useUploadIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ doc, selfie }: { doc: File; selfie: File }) =>
      DocumentsApi.uploadIdentity(doc, selfie),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUploadBackground() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (doc: File) => DocumentsApi.uploadBackground(doc),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAddCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, file }: { title: string; file: File }) =>
      DocumentsApi.addCertificate(title, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRemoveCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DocumentsApi.removeCertificate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
