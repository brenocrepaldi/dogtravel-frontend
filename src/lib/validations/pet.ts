export const PET_IMAGE_ACCEPT = "image/jpeg,image/png";
export const PET_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const ACCEPTED_MIME_TYPES = new Set(["image/jpeg", "image/png"]);

export function validatePetImage(file: File): string | null {
  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    return "Use apenas arquivos JPG ou PNG.";
  }
  if (file.size > PET_IMAGE_MAX_BYTES) {
    return "A imagem deve ter no máximo 5MB.";
  }
  return null;
}
