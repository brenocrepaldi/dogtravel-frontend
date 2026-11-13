"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Landmark,
  Loader2,
  Save,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/empty-state";
import { useWalkerBankAccount, useUpdateWalkerBankAccount } from "@/features/walkers/hooks/use-walkers";
import { maskCpfCnpj } from "@/lib/cpf";
import { bankAccountSchema, type BankAccountFormValues } from "@/lib/validations/walker";
import { cn } from "@/lib/utils";
import { BankAccountSummary } from "./_components/bank-account-summary";

const EMPTY_FORM: BankAccountFormValues = {
  bankName: "",
  accountType: "checking",
  branch: "",
  accountNumber: "",
  holderName: "",
  holderDocument: "",
  pixKey: "",
};

function PageSkeleton() {
  return (
    <>
      {/* Phones: shaped like the account card, the PIX row and the edit button. */}
      <div className="space-y-4 animate-pulse md:hidden">
        <div className="h-52 rounded-2xl bg-muted" />
        <div className="h-[74px] rounded-xl bg-muted" />
        <div className="h-11 rounded-lg bg-muted" />
      </div>
      <div className="space-y-6 animate-pulse max-md:hidden">
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
      </div>
    </>
  );
}

function MobileHeader() {
  return (
    <div className="flex items-center gap-1 md:hidden">
      <Link
        href="/profile"
        aria-label="Voltar ao perfil"
        className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors active:bg-accent/60"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Dados bancários</h1>
        <p className="text-sm text-muted-foreground">Onde você recebe pelos passeios</p>
      </div>
    </div>
  );
}

function DesktopHeader() {
  return (
    <div className="flex items-center gap-3 max-md:hidden">
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
  );
}

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    // Phones: a plain heading above a borderless-header card, like the other profile
    // screens; md+: the card with its icon header strip.
    <section className="max-md:space-y-2">
      <h2 className="px-1 text-base font-semibold text-foreground md:hidden">{title}</h2>
      <Card className="overflow-hidden py-0 gap-0">
        <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-3.5 max-md:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <CardContent className="p-5 space-y-4 max-md:p-4">{children}</CardContent>
      </Card>
    </section>
  );
}

function FieldRow({ label, htmlFor, error, children }: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-xs font-medium uppercase tracking-wider text-muted-foreground max-md:text-sm max-md:normal-case max-md:tracking-normal max-md:text-foreground"
      >
        {label}
      </Label>
      {children}
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function BankAccountPage() {
  const { data: bankAccount, isLoading, isError, refetch, isRefetching } = useWalkerBankAccount();
  const { mutate: updateBankAccount, isPending: isSaving } = useUpdateWalkerBankAccount();
  // The API answers {} when the walker never saved an account.
  const hasAccount = Boolean(bankAccount?.bankName);
  // Phones show the saved account as a card; the form only opens on "Editar".
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    // Resetting with the empty {} would clear "Corrente" and leave no account type picked.
    if (!bankAccount?.bankName) return;
    reset({ ...bankAccount, pixKey: bankAccount.pixKey ?? "" });
  }, [bankAccount, reset]);

  function onSubmit(data: BankAccountFormValues) {
    updateBankAccount(data, {
      onSuccess: () => {
        toast.success("Dados bancários atualizados!");
        setEditing(false);
      },
      onError:   () => toast.error("Erro ao salvar. Tente novamente."),
    });
  }

  function cancelEditing() {
    if (bankAccount) reset({ ...bankAccount, pixKey: bankAccount.pixKey ?? "" });
    setEditing(false);
  }

  const accountType = useWatch({ control, name: "accountType" });
  const holderDocument = register("holderDocument");
  const showSummary = hasAccount && !editing;

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6 pb-8 max-md:space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-7 w-48 rounded bg-muted" />
        </div>
        <PageSkeleton />
      </div>
    );
  }

  // A failed load used to show an empty form, as if no account had ever been saved.
  if (isError && !bankAccount) {
    return (
      <div className="max-w-2xl space-y-6 pb-8 max-md:space-y-4">
        <MobileHeader />
        <DesktopHeader />
        <EmptyState
          icon={WifiOff}
          title="Não foi possível carregar seus dados bancários"
          description="Verifique sua conexão e tente novamente."
          actionLabel={isRefetching ? "Tentando..." : "Tentar novamente"}
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className={cn("group/form max-w-2xl space-y-6 pb-8 max-md:space-y-4", !showSummary && "max-md:pb-20")}>
      <MobileHeader />
      <DesktopHeader />

      {showSummary && bankAccount && (
        <BankAccountSummary account={bankAccount} onEdit={() => setEditing(true)} />
      )}

      {!hasAccount && (
        <section className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4 md:hidden">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-foreground">Cadastre sua conta</p>
            <p className="text-sm text-muted-foreground">
              Informe onde você quer receber o valor dos seus passeios.
            </p>
          </div>
        </section>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn("space-y-6 max-md:space-y-5", showSummary && "max-md:hidden")}
      >
        <Section icon={Building2} title="Conta bancária">
          <FieldRow label="Banco" htmlFor="bankName" error={errors.bankName?.message}>
            <Input
              id="bankName"
              placeholder="Ex: Nubank, Itaú, Bradesco..."
              autoCapitalize="words"
              autoComplete="off"
              enterKeyHint="next"
              {...register("bankName")}
              aria-invalid={!!errors.bankName}
              className="rounded-lg"
            />
          </FieldRow>
          <div className="grid grid-cols-2 gap-4 max-md:gap-3">
            <FieldRow label="Agência" htmlFor="branch" error={errors.branch?.message}>
              <Input
                id="branch"
                placeholder="Ex: 0001"
                autoComplete="off"
                enterKeyHint="next"
                {...register("branch")}
                aria-invalid={!!errors.branch}
                className="rounded-lg"
              />
            </FieldRow>
            <FieldRow label="Conta" htmlFor="accountNumber" error={errors.accountNumber?.message}>
              <Input
                id="accountNumber"
                placeholder="Ex: 12345-6"
                autoComplete="off"
                enterKeyHint="next"
                {...register("accountNumber")}
                aria-invalid={!!errors.accountNumber}
                className="rounded-lg"
              />
            </FieldRow>
          </div>
          <FieldRow label="Tipo de conta">
            <div className="flex gap-3" role="group" aria-label="Tipo de conta">
              {([
                { value: "checking", label: "Corrente" },
                { value: "savings",  label: "Poupança" },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={accountType === value}
                  onClick={() => setValue("accountType", value)}
                  className={[
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer max-md:h-11",
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
          <FieldRow label="Nome do titular" htmlFor="holderName" error={errors.holderName?.message}>
            <Input
              id="holderName"
              placeholder="Nome conforme consta no banco"
              autoCapitalize="words"
              autoComplete="name"
              enterKeyHint="next"
              {...register("holderName")}
              aria-invalid={!!errors.holderName}
              className="rounded-lg"
            />
          </FieldRow>
          <FieldRow label="CPF / CNPJ" htmlFor="holderDocument" error={errors.holderDocument?.message}>
            <Input
              id="holderDocument"
              placeholder="000.000.000-00"
              inputMode="numeric"
              autoComplete="off"
              enterKeyHint="next"
              maxLength={18}
              {...holderDocument}
              onChange={(e) => {
                e.target.value = maskCpfCnpj(e.target.value);
                return holderDocument.onChange(e);
              }}
              aria-invalid={!!errors.holderDocument}
              className="rounded-lg"
            />
          </FieldRow>
          <FieldRow label="Chave PIX (opcional)" htmlFor="pixKey">
            <Input
              id="pixKey"
              placeholder="CPF, e-mail, telefone ou chave aleatória"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              {...register("pixKey")}
              className="rounded-lg"
            />
          </FieldRow>
        </Section>

        {/* Save. Phones: floats just above the bottom nav (position: fixed like the nav, as on
            the walker profile), and hides while a field is focused so it never covers the
            keyboard's field. Editing a saved account adds "Cancelar" next to it. */}
        <div className="flex justify-end max-md:fixed max-md:inset-x-0 max-md:bottom-[calc(5.75rem+env(safe-area-inset-bottom))] max-md:z-30 max-md:gap-2 max-md:px-4 max-md:group-has-[input:focus]/form:hidden">
          {hasAccount && (
            <Button
              type="button"
              variant="outline"
              onClick={cancelEditing}
              disabled={isSaving}
              className="h-12 flex-1 rounded-lg bg-background text-base shadow-lg md:hidden"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSaving}
            className="gap-2 rounded-lg shadow-sm max-md:h-12 max-md:flex-1 max-md:text-base max-md:shadow-lg max-md:shadow-primary/25"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Salvando..." : "Salvar dados"}
          </Button>
        </div>
      </form>
    </div>
  );
}
