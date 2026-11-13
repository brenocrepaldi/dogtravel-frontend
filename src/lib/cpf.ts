/**
 * Formata rigorosamente uma string de CPF 
 * Adiciona pontuação (000.000.000-00) dinamicamente.
 */
export const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

/**
 * Valida um CPF brasileiro através do cálculo dos dígitos verificadores.
 * Retorna true se for um CPF matematicamente válido.
 */
export const isValidCPF = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/\D/g, "");

  if (cleanCpf.length !== 11) return false;

  // Bloqueia sequências obviamente inválidas como "00000000000"
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

  let sum = 0;
  let remainder = 0;

  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i), 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10), 10)) return false;

  // Segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i), 10) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(10, 11), 10)) return false;

  return true;
};

/**
 * Formata CPF (até 11 dígitos) ou CNPJ (12 a 14 dígitos) enquanto o usuário digita:
 * 000.000.000-00 ou 00.000.000/0000-00.
 */
export const maskCpfCnpj = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) return maskCPF(digits);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

/**
 * Esconde o início e o fim de um CPF para exibição (•••.982.247-••). CNPJ, por ser público,
 * aparece formatado por inteiro; qualquer outra coisa volta como veio.
 */
export const hideDocument = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) return `•••.${digits.slice(3, 6)}.${digits.slice(6, 9)}-••`;
  if (digits.length === 14) return maskCpfCnpj(digits);
  return value;
};
