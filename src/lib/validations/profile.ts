import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
