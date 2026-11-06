"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, CreditCard, Loader2, Plus, Smartphone } from "lucide-react";
import { FlowActions } from "@/components/common/flow-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PIX_INSTANT_ID } from "@/config/pricing";
import { usePaymentMethods, useAddPaymentMethod } from "@/features/payments/hooks/use-payments";
import { toast } from "sonner";
import type { WalkFormData } from "../walk-request-form";

// ─── Constants ──────────────────────────────────────────────────────────────

const METHOD_ICON = {
  credit_card: CreditCard,
  debit_card:  CreditCard,
  pix:         Smartphone,
} as const;

interface MethodFormState {
  type:       "credit_card" | "debit_card" | "pix";
  brand:      string;
  holderName: string;
  expiresAt:  string;
  value:      string;
}

const INITIAL_FORM: MethodFormState = {
  type:       "credit_card",
  brand:      "Visa",
  holderName: "",
  expiresAt:  "",
  value:      "",
};

const TYPE_OPTIONS: { value: MethodFormState["type"]; label: string; icon: typeof CreditCard }[] = [
  { value: "credit_card", label: "Crédito",  icon: CreditCard  },
  { value: "debit_card",  label: "Débito",   icon: CreditCard  },
  { value: "pix",         label: "PIX",      icon: Smartphone  },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  data:       WalkFormData;
  updateData: (partial: Partial<WalkFormData>) => void;
  onNext:     () => void;
  onBack:     () => void;
}

export function StepPayment({ data, updateData, onNext, onBack }: Props) {
  const { data: methods = [] } = usePaymentMethods();
  const { mutate: addMethod, isPending: saving } = useAddPaymentMethod();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form,          setForm]          = useState<MethodFormState>(INITIAL_FORM);

  function closeDialog() {
    setForm(INITIAL_FORM);
    setShowAddDialog(false);
  }

  function switchType(type: MethodFormState["type"]) {
    setForm((c) => ({
      ...c,
      type,
      value: "",
      brand: type === "pix" ? "PIX" : c.type === "pix" ? "Visa" : c.brand,
    }));
  }

  function handleAddMethod() {
    if (form.type !== "pix" && !form.brand.trim()) {
      toast.error("Informe a bandeira do cartão.");
      return;
    }
    if (!form.holderName.trim()) {
      toast.error("Informe o nome do titular.");
      return;
    }
    if (!form.value.trim()) {
      toast.error(form.type === "pix" ? "Informe a chave PIX." : "Informe os últimos 4 dígitos.");
      return;
    }
    if (form.type !== "pix" && !/^\d{4}$/.test(form.value.trim())) {
      toast.error("Digite exatamente 4 dígitos para o cartão.");
      return;
    }

    const label = form.type === "pix" ? form.value.trim() : `**** ${form.value.trim()}`;
    addMethod(
      {
        type:       form.type,
        brand:      form.brand,
        label,
        holderName: form.holderName.trim(),
        expiresAt:  form.type === "pix" ? "--" : form.expiresAt || "12/29",
        isDefault:  methods.length === 0,
        status:     "active",
      },
      {
        onSuccess: (newMethod) => {
          updateData({ selectedMethodId: newMethod.id });
          closeDialog();
          toast.success("Método adicionado e selecionado.");
        },
        onError: () => toast.error("Erro ao adicionar método. Tente novamente."),
      },
    );
  }

  const isCard = form.type !== "pix";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Forma de pagamento</h2>
        <p className="text-sm text-muted-foreground">
          Selecione o método que será usado após a conclusão do passeio.
        </p>
      </div>

      <div className="space-y-2">
        {/* PIX — always available, no registration needed */}
        <button
          type="button"
          onClick={() => updateData({ selectedMethodId: PIX_INSTANT_ID })}
          className={cn(
            "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer",
            "hover:border-primary/60 hover:bg-primary/5",
            data.selectedMethodId === PIX_INSTANT_ID
              ? "border-primary bg-primary/5 ring-1 ring-primary/30"
              : "border-border bg-background",
          )}
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">PIX</p>
            <p className="text-xs text-muted-foreground">Pagamento instantâneo via QR Code</p>
          </div>
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
              data.selectedMethodId === PIX_INSTANT_ID ? "bg-primary border-primary" : "border-border",
            )}
          >
            {data.selectedMethodId === PIX_INSTANT_ID && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
        </button>

        {/* Saved cards */}
        {methods.length > 0 && (
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pt-2 pb-1 px-1">
            Cartões salvos
          </p>
        )}
        {methods.map((method) => {
          const Icon     = METHOD_ICON[method.type];
          const selected = data.selectedMethodId === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => updateData({ selectedMethodId: method.id })}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer",
                "hover:border-primary/60 hover:bg-primary/5",
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-background",
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{method.brand ?? method.label}</p>
                <p className="text-xs text-muted-foreground">{method.label}</p>
              </div>
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  selected ? "bg-primary border-primary" : "border-border",
                )}
              >
                {selected && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
            </button>
          );
        })}
      </div>

      <Button
        variant="outline"
        type="button"
        className="gap-2 cursor-pointer"
        onClick={() => setShowAddDialog(true)}
      >
        <Plus className="h-4 w-4" />
        Adicionar cartão
      </Button>

      {/* ── Add card dialog ────────────────────────────────────────────── */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Novo método de pagamento</DialogTitle>
                <DialogDescription className="mt-0.5">
                  Informe os dados do cartão ou chave PIX.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5">
            {/* Type chips */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo</Label>
              <div className="grid grid-cols-3 gap-2">
                {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => switchType(value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-all duration-150 cursor-pointer",
                      form.type === value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium leading-none">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card fields */}
            {isCard && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Bandeira</Label>
                  <Input
                    value={form.brand}
                    placeholder="Visa"
                    onChange={(e) => setForm((c) => ({ ...c, brand: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Últimos 4 dígitos</Label>
                  <Input
                    value={form.value}
                    placeholder="4242"
                    maxLength={4}
                    onChange={(e) => setForm((c) => ({ ...c, value: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* PIX key */}
            {!isCard && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Chave PIX</Label>
                <Input
                  value={form.value}
                  placeholder="email@exemplo.com ou CPF"
                  onChange={(e) => setForm((c) => ({ ...c, value: e.target.value }))}
                />
              </div>
            )}

            {/* Holder + expiry */}
            <div className={cn("grid gap-3", isCard ? "grid-cols-2" : "grid-cols-1")}>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Titular</Label>
                <Input
                  value={form.holderName}
                  placeholder={isCard ? "Nome no cartão" : "Nome completo"}
                  onChange={(e) => setForm((c) => ({ ...c, holderName: e.target.value }))}
                />
              </div>
              {isCard && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Validade</Label>
                  <Input
                    value={form.expiresAt}
                    placeholder="12/29"
                    onChange={(e) => setForm((c) => ({ ...c, expiresAt: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              type="button"
              className="cursor-pointer"
              onClick={closeDialog}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="cursor-pointer"
              onClick={handleAddMethod}
              disabled={saving}
            >
              {saving
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Check className="h-4 w-4" />}
              {saving ? "Salvando..." : "Salvar método"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FlowActions
        showBack
        onBack={onBack}
        primaryLabel="Continuar"
        primaryIcon={<ArrowRight className="h-4 w-4" />}
        onPrimary={onNext}
        primaryDisabled={!data.selectedMethodId}
      />
    </div>
  );
}
