"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Dog, ArrowLeft, UserStar } from "lucide-react";
import type { Value as PhoneValue } from "react-phone-number-input";

import { cn } from "@/lib/utils";
import { maskCPF } from "@/lib/cpf";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";
import type { UserRole } from "@/types";
import { useRegister } from "@/features/auth/hooks/use-auth";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";

// ─── Role Cards ───────────────────────────────────────────────────────────────
const roleOptions: {
  value: UserRole;
  icon: React.ElementType;
  title: string;
  description: string;
}[] = [
  {
    value: "client",
    icon: Dog,
    title: "Sou dono de cão",
    description: "Quero solicitar passeios para o meu pet",
  },
  {
    value: "walker",
    icon: UserStar,
    title: "Sou passeador",
    description: "Quero oferecer passeios e ganhar dinheiro",
  },
];

// ─── Step 1 — Role Selection ──────────────────────────────────────────────────
function RoleStep({
  onSelect,
}: {
  onSelect: (role: UserRole) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
        <p className="text-muted-foreground text-sm">Como você quer usar o DogTravel?</p>
      </div>

      <div className="grid gap-4">
        {roleOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={cn(
              "flex items-start gap-4 p-5 rounded-xl border border-border text-left",
              "hover:border-primary/60 hover:bg-primary/5 transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            )}
          >
            <div className="mt-0.5 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <option.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{option.title}</p>
              <p className="text-muted-foreground text-sm mt-0.5">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Entrar
        </Link>
      </p>
    </div>
  );
}

// ─── Step 2 — User Data Form ──────────────────────────────────────────────────
function DataStep({
  role,
  onBack,
}: {
  role: UserRole;
  onBack: () => void;
}) {
  const router = useRouter();
  const { mutateAsync: register } = useRegister();

  const {
    register: registerField,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormValues) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _, ...registerData } = data;
      await register({ ...registerData, role });

      toast.success("Conta criada com sucesso!", {
        description: "Bem-vindo ao DogTravel!",
      });

      // Auto-login after registration
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.ok) {
        // Walkers are directed to complete their professional profile before starting
        router.push(role === "walker" ? "/profile/walker-profile?onboarding=true" : "/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err) {
      const apiMessage =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message?.message ??
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message ??
        null;
      toast.error("Erro ao criar conta", {
        description:
          typeof apiMessage === "string"
            ? apiMessage
            : "Tente novamente em instantes.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold tracking-tight">
          {role === "client" ? "Dados do dono" : "Dados do passeador"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Preencha suas informações para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            placeholder="Seu nome"
            autoComplete="name"
            {...registerField("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-destructive text-xs">{errors.name.message}</p>
          )}
        </div>
        {/* CPF */}
        <div className="space-y-1.5">
          <Label htmlFor="cpf">CPF</Label>
          <Controller
            control={control}
            name="cpf"
            render={({ field: { value, onChange, ...field } }) => (
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                autoComplete="off"
                inputMode="numeric"
                maxLength={14}
                value={value || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange(maskCPF(val));
                }}
                onKeyDown={(e) => {
                  // Prevent typing letters and special chars directly (except navigation/control keys)
                  if (!/[\d.-]/.test(e.key) && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                  }
                }}
                {...field}
                aria-invalid={!!errors.cpf}
              />
            )}
          />
          {errors.cpf && (
            <p className="text-destructive text-xs">{errors.cpf.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            {...registerField("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone</Label>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <PhoneInput
                id="phone"
                defaultCountry="BR"
                international
                value={field.value as PhoneValue}
                onChange={(value) => field.onChange(value ?? "")}
                className={cn(errors.phone && "ring-1 ring-destructive rounded-lg")}
              />
            )}
          />
          {errors.phone && (
            <p className="text-destructive text-xs">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            {...registerField("password")}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-destructive text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repita a senha"
            autoComplete="new-password"
            {...registerField("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="text-destructive text-xs">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  function handleRoleSelect(role: UserRole) {
    setSelectedRole(role);
    setStep(2);
  }

  if (step === 1) {
    return <RoleStep onSelect={handleRoleSelect} />;
  }

  return (
    <DataStep role={selectedRole!} onBack={() => setStep(1)} />
  );
}
