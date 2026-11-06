import { describe, expect, it } from "vitest";
import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth";
import { bankAccountSchema } from "./walker";
import { profileSchema } from "./profile";
import { PET_IMAGE_MAX_BYTES, validatePetImage } from "./pet";

function messages(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.success ? [] : result.error!.issues.map((i) => i.message);
}

const validRegister = {
  name: "Maria Souza",
  cpf: "529.982.247-25",
  email: "maria@exemplo.com",
  phone: "(11) 91234-5678",
  password: "segredo1",
  confirmPassword: "segredo1",
};

describe("registerSchema", () => {
  it("accepts a valid registration", () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true);
  });

  it("rejects an invalid CPF", () => {
    expect(messages(registerSchema.safeParse({ ...validRegister, cpf: "529.982.247-26" }))).toContain("CPF inválido");
  });

  it("rejects an incomplete CPF", () => {
    expect(messages(registerSchema.safeParse({ ...validRegister, cpf: "529.982" }))).toContain("CPF incompleto");
  });

  it("rejects mismatched passwords on the confirmation field", () => {
    const result = registerSchema.safeParse({ ...validRegister, confirmPassword: "outra-senha" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.message === "As senhas não coincidem");
      expect(issue?.path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects short names, passwords, phones and bad e-mails", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      name: "A",
      password: "123",
      confirmPassword: "123",
      phone: "123",
      email: "nao-e-email",
    });
    expect(messages(result)).toEqual(
      expect.arrayContaining([
        "Nome deve ter pelo menos 2 caracteres",
        "E-mail inválido",
        "Telefone inválido",
        "Senha deve ter pelo menos 6 caracteres",
      ]),
    );
  });
});

describe("forgot and reset password schemas", () => {
  it("validates the e-mail", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    expect(messages(forgotPasswordSchema.safeParse({ email: "x" }))).toContain("E-mail inválido");
  });

  it("requires matching passwords of at least 6 characters", () => {
    expect(resetPasswordSchema.safeParse({ password: "abcdef", confirmPassword: "abcdef" }).success).toBe(true);
    expect(messages(resetPasswordSchema.safeParse({ password: "abcdef", confirmPassword: "abcdeg" }))).toContain(
      "As senhas não coincidem",
    );
    expect(messages(resetPasswordSchema.safeParse({ password: "abc", confirmPassword: "abc" }))).toContain(
      "Senha deve ter pelo menos 6 caracteres",
    );
  });
});

describe("profileSchema", () => {
  it("accepts valid data and rejects invalid fields", () => {
    expect(profileSchema.safeParse({ name: "Ana", email: "ana@x.com", phone: "11912345678" }).success).toBe(true);
    expect(messages(profileSchema.safeParse({ name: "A", email: "x", phone: "1" }))).toHaveLength(3);
  });
});

describe("bankAccountSchema", () => {
  const valid = {
    bankName: "Banco do Brasil",
    accountType: "checking" as const,
    branch: "1234",
    accountNumber: "12345-6",
    holderName: "Maria Souza",
    holderDocument: "529.982.247-25",
  };

  it("accepts a valid account, with or without a PIX key", () => {
    expect(bankAccountSchema.safeParse(valid).success).toBe(true);
    expect(bankAccountSchema.safeParse({ ...valid, pixKey: "maria@exemplo.com" }).success).toBe(true);
  });

  it("rejects an unknown account type", () => {
    expect(bankAccountSchema.safeParse({ ...valid, accountType: "salary" }).success).toBe(false);
  });

  it("validates the branch and account number formats", () => {
    expect(messages(bankAccountSchema.safeParse({ ...valid, branch: "12a" }))).toContain("Agência inválida");
    expect(messages(bankAccountSchema.safeParse({ ...valid, accountNumber: "12-34" }))).toContain(
      "Número de conta inválido",
    );
    expect(bankAccountSchema.safeParse({ ...valid, branch: "1234-5" }).success).toBe(true);
  });

  it("rejects a document with letters or too few characters", () => {
    expect(messages(bankAccountSchema.safeParse({ ...valid, holderDocument: "123" }))).toContain(
      "CPF/CNPJ incompleto",
    );
    expect(messages(bankAccountSchema.safeParse({ ...valid, holderDocument: "5299822472a" }))).toContain(
      "Documento inválido",
    );
  });
});

describe("validatePetImage", () => {
  const file = (type: string, size: number) => new File([new Uint8Array(size)], "pet", { type });

  it("accepts JPG and PNG up to the size limit", () => {
    expect(validatePetImage(file("image/jpeg", 1024))).toBeNull();
    expect(validatePetImage(file("image/png", PET_IMAGE_MAX_BYTES))).toBeNull();
  });

  it("rejects other types", () => {
    expect(validatePetImage(file("image/gif", 10))).toBe("Use apenas arquivos JPG ou PNG.");
    expect(validatePetImage(file("application/pdf", 10))).toBe("Use apenas arquivos JPG ou PNG.");
  });

  it("rejects files above the limit", () => {
    expect(validatePetImage(file("image/png", PET_IMAGE_MAX_BYTES + 1))).toBe("A imagem deve ter no máximo 5MB.");
  });
});
