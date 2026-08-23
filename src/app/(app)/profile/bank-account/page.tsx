"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWalkerBankAccount, useUpdateWalkerBankAccount } from "@/features/walkers/hooks/use-walkers";
import { bankAccountSchema, type BankAccountFormValues } from "@/lib/validations/walker";

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 rounded-xl bg-muted" />
      <div className="h-32 rounded-xl bg-muted" />
    </div>
  );
}

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-3.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 shrink-0">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <CardContent className="p-5 space-y-4">{children}</CardContent>
    </Card>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

export default function BankAccountPage() {
  const { data: bankAccount, isLoading } = useWalkerBankAccount();
  const { mutate: updateBankAccount, isPending: isSaving } = useUpdateWalkerBankAccount();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bankName: "",
      accountType: "checking",
      branch: "",
      accountNumber: "",
      holderName: "",
      holderDocument: "",
      pixKey: "",
    },
  });

  useEffect(() => {
    if (!bankAccount) return;
    reset({ ...bankAccount, pixKey: bankAccount.pixKey ?? "" });
  }, [bankAccount, reset]);

  function onSubmit(data: BankAccountFormValues) {
    updateBankAccount(data, {
      onSuccess: () => toast.success("Dados bancários atualizados!"),
      onError:   () => toast.error("Erro ao salvar. Tente novamente."),
    });
  }

  const accountType = watch("accountType");

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-7 w-48 rounded bg-muted" />
        </div>
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" render={<Link href="/profile" />} aria-label="Voltar">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dados bancários</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Conta utilizada para receber seus repasses.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Section icon={Building2} title="Conta bancária">
          <FieldRow label="Banco">
            <Input
              placeholder="Ex: Nubank, Itaú, Bradesco..."
              {...register("bankName")}
              aria-invalid={!!errors.bankName}
              className="rounded-lg"
            />
            {errors.bankName && (
              <p className="text-destructive text-xs mt-1">{errors.bankName.message}</p>
            )}
          </FieldRow>
          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Agência">
              <Input
                placeholder="Ex: 0001"
                {...register("branch")}
                aria-invalid={!!errors.branch}
                className="rounded-lg"
              />
              {errors.branch && (
                <p className="text-destructive text-xs mt-1">{errors.branch.message}</p>
              )}
            </FieldRow>
            <FieldRow label="Conta">
              <Input
                placeholder="Ex: 12345-6"
                {...register("accountNumber")}
                aria-invalid={!!errors.accountNumber}
                className="rounded-lg"
              />
              {errors.accountNumber && (
                <p className="text-destructive text-xs mt-1">{errors.accountNumber.message}</p>
              )}
            </FieldRow>
          </div>
          <FieldRow label="Tipo de conta">
            <div className="flex gap-3">
              {([
                { value: "checking", label: "Corrente" },
                { value: "savings",  label: "Poupança" },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("accountType", value)}
                  className={[
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer",
                    accountType === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </FieldRow>
        </Section>

        <Section icon={Building2} title="Titular e chave PIX">
          <FieldRow label="Nome do titular">
            <Input
              placeholder="Nome conforme consta no banco"
              {...register("holderName")}
              aria-invalid={!!errors.holderName}
              className="rounded-lg"
            />
            {errors.holderName && (
              <p className="text-destructive text-xs mt-1">{errors.holderName.message}</p>
            )}
          </FieldRow>
          <FieldRow label="CPF / CNPJ">
            <Input
              placeholder="000.000.000-00"
              {...register("holderDocument")}
              aria-invalid={!!errors.holderDocument}
              className="rounded-lg"
            />
            {errors.holderDocument && (
              <p className="text-destructive text-xs mt-1">{errors.holderDocument.message}</p>
            )}
          </FieldRow>
          <FieldRow label="Chave PIX (opcional)">
            <Input
              placeholder="CPF, e-mail, telefone ou chave aleatória"
              {...register("pixKey")}
              className="rounded-lg"
            />
          </FieldRow>
        </Section>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="gap-2 rounded-lg shadow-sm">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Salvando..." : "Salvar dados"}
          </Button>
        </div>
      </form>
    </div>
  );
}
