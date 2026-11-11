"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import { useProfile } from "@/features/profile/hooks/use-profile";
import {
  useUpdateWalkerAvailability,
  useWalkerAvailability,
  useWalkerProfile,
} from "./use-walkers";

/**
 * The walker's "available for walks" switch: current state, whether the
 * profile is complete enough to turn it on (photo + verified identity and
 * background check), and a toggle that explains what is missing when it isn't.
 */
export function useAvailabilityToggle() {
  const router = useRouter();

  const { data: walkerProfile } = useWalkerProfile();
  const walkerProfileId = walkerProfile?.id ?? "";
  const { data: available = false, isLoading: availabilityLoading } = useWalkerAvailability(walkerProfileId);
  const { mutate: updateAvailability, isPending: isUpdating } = useUpdateWalkerAvailability(walkerProfileId);

  const { data: documents, isLoading: documentsLoading } = useDocuments();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const hasPhoto = !!profile?.avatarUrl;
  const identityVerified = documents?.identity === "verified";
  const backgroundVerified = documents?.background === "verified";
  const isEligibilityLoading = documentsLoading || profileLoading;
  const canToggle = !isEligibilityLoading && hasPhoto && identityVerified && backgroundVerified;

  function toggle() {
    if (!hasPhoto) {
      toast.warning("Foto de perfil necessária", {
        description: "Adicione uma foto ao seu perfil antes de ativar sua disponibilidade.",
        action: { label: "Atualizar perfil", onClick: () => router.push("/profile") },
      });
      return;
    }
    if (!canToggle) {
      toast.warning("Verificação de identidade necessária", {
        description: "Complete a verificação antes de ativar sua disponibilidade.",
        action: { label: "Verificar agora", onClick: () => router.push("/profile/documents") },
      });
      return;
    }
    if (!backgroundVerified) {
      toast.warning("Antecedentes criminais necessários", {
        description: "Envie seu comprovante de antecedentes antes de ativar sua disponibilidade.",
        action: { label: "Enviar agora", onClick: () => router.push("/profile/documents") },
      });
      return;
    }
    const next = !available;
    updateAvailability(next, {
      onSuccess: () => {
        if (next) toast.success("Você está disponível para passeios");
        else toast.warning("Você ficou indisponível");
      },
      onError: () => toast.error("Erro ao atualizar disponibilidade."),
    });
  }

  return {
    walkerProfileId,
    available,
    canToggle,
    isLoading: isEligibilityLoading || (!!walkerProfileId && availabilityLoading) || !walkerProfile,
    isUpdating,
    toggle,
  };
}
