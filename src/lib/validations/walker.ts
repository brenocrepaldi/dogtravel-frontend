import { z } from "zod";

export const bankAccountSchema = z.object({
  bankName: z.string().min(2, "Informe o nome do banco"),
  accountType: z.enum(["checking", "savings"]),
  branch: z
    .string()
    .min(1, "Agência obrigatória")
    .regex(/^\d{1,6}(-\d)?$/, "Agência inválida"),
  accountNumber: z
    .string()
    .min(1, "Conta obrigatória")
    .regex(/^\d{1,12}(-\d)?$/, "Número de conta inválido"),
  holderName: z.string().min(2, "Informe o nome do titular"),
  holderDocument: z
    .string()
    .min(11, "CPF/CNPJ incompleto")
    .regex(/^[\d.\-\/]+$/, "Documento inválido"),
  pixKey: z.string().optional(),
});

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>;
