'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  Plus,
  Smartphone,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ManagedPaymentMethod } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LoadingState } from '@/components/common/loading-state';
import {
  usePaymentMethods,
  useAddPaymentMethod,
  useRemovePaymentMethod,
  useSetDefaultMethod,
} from '@/features/payments/hooks/use-payments';

// ─── Constants ────────────────────────────────────────────────────────────────

interface MethodFormState {
  type: 'credit_card' | 'debit_card' | 'pix';
  brand: string;
  holderName: string;
  expiresAt: string;
  value: string;
}

const INITIAL_FORM: MethodFormState = {
  type: 'credit_card',
  brand: 'Visa',
  holderName: '',
  expiresAt: '',
  value: '',
};

const METHOD_ICON = {
  credit_card: CreditCard,
  debit_card: CreditCard,
  pix: Smartphone,
} as const;

const TYPE_OPTIONS: { value: MethodFormState['type']; label: string; icon: typeof CreditCard }[] =
  [
    { value: 'credit_card', label: 'Crédito', icon: CreditCard },
    { value: 'debit_card', label: 'Débito', icon: CreditCard },
    { value: 'pix', label: 'PIX', icon: Smartphone },
  ];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentMethodsPage() {
  const searchParams = useSearchParams();
  const [showAddForm, setShowAddForm] = useState(
    () => searchParams.get('action') === 'add',
  );
  const [form, setForm] = useState<MethodFormState>(INITIAL_FORM);

  const { data: methods = [], isLoading, isError, refetch } = usePaymentMethods();
  const { mutate: addMethod, isPending: isAdding } = useAddPaymentMethod();
  const { mutate: removeMethod, isPending: isRemoving } = useRemovePaymentMethod();
  const { mutate: setDefault, isPending: isSettingDefault } = useSetDefaultMethod();

  function cancelForm() {
    setForm(INITIAL_FORM);
    setShowAddForm(false);
  }

  function switchType(type: MethodFormState['type']) {
    setForm((c) => ({
      ...c,
      type,
      value: '',
      brand: type === 'pix' ? 'PIX' : c.type === 'pix' ? 'Visa' : c.brand,
    }));
  }

  function handleSetDefault(methodId: string) {
    setDefault(methodId, {
      onSuccess: () => toast.success('Método padrão atualizado.'),
      onError: () => toast.error('Erro ao definir método padrão.'),
    });
  }

  function handleRemove(methodId: string) {
    removeMethod(methodId, {
      onSuccess: () => toast.success('Método removido.'),
      onError: () => toast.error('Erro ao remover método.'),
    });
  }

  function handleAddMethod() {
    if (form.type !== 'pix' && !form.brand.trim()) {
      toast.error('Informe a bandeira do cartão.');
      return;
    }
    if (!form.holderName.trim()) {
      toast.error('Informe o nome do titular.');
      return;
    }
    if (!form.value.trim()) {
      toast.error(form.type === 'pix' ? 'Informe a chave PIX.' : 'Informe os últimos 4 dígitos.');
      return;
    }
    if (form.type !== 'pix' && !/^\d{4}$/.test(form.value.trim())) {
      toast.error('Digite exatamente 4 dígitos para o cartão.');
      return;
    }

    const label = form.type === 'pix' ? form.value.trim() : `**** ${form.value.trim()}`;
    addMethod(
      {
        type: form.type,
        brand: form.brand,
        label,
        holderName: form.holderName.trim(),
        expiresAt: form.type === 'pix' ? '--' : form.expiresAt || '12/29',
        isDefault: methods.length === 0,
        status: 'active',
      },
      {
        onSuccess: () => {
          cancelForm();
          toast.success('Método adicionado com sucesso.');
        },
        onError: () => toast.error('Erro ao adicionar método.'),
      },
    );
  }

  const isCard = form.type !== 'pix';
  const isMutating = isAdding || isRemoving || isSettingDefault;

  // ── Render helpers ──────────────────────────────────────────────────────────

  function renderList() {
    if (isLoading) {
      return <LoadingState variant="section" text="Carregando métodos..." />;
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Erro ao carregar</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Não foi possível carregar seus métodos de pagamento.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      );
    }

    if (methods.length === 0) {
      return (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
            <WalletCards className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Nenhum método cadastrado</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Adicione um cartão ou chave PIX para agilizar seus pagamentos.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Adicionar método
          </Button>
        </div>
      );
    }

    return (
      <div className="divide-y divide-border/60">
        {methods.map((method: ManagedPaymentMethod) => {
          const Icon = METHOD_ICON[method.type];
          return (
            <div key={method.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">
                    {method.brand ? `${method.brand} ` : ''}{method.label}
                  </p>
                  {method.isDefault && (
                    <Badge variant="success" className="gap-1">
                      Padrão
                    </Badge>
                  )}
                  {method.status === 'expired' && (
                    <Badge variant="warning">Expirado</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {method.holderName}
                  {method.type !== 'pix' && ` · expira ${method.expiresAt}`}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!method.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs cursor-pointer"
                    disabled={isMutating}
                    onClick={() => handleSetDefault(method.id)}
                  >
                    Definir padrão
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  disabled={isMutating}
                  onClick={() => handleRemove(method.id)}
                  aria-label="Remover método"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 pb-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href="/profile" />}
          aria-label="Voltar para pagamentos"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Métodos de pagamento
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie seus cartões e chaves PIX.
          </p>
        </div>
        {!showAddForm && !isLoading && !isError && (
          <Button
            size="sm"
            className="gap-2 shrink-0 cursor-pointer"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <Card className="overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Novo método</p>
                  <p className="text-xs text-muted-foreground">Preencha os dados abaixo</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer"
                onClick={cancelForm}
                aria-label="Fechar formulário"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Separator />

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
                      'flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-all duration-150 cursor-pointer',
                      form.type === value
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
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
            <div className={cn('grid gap-3', isCard ? 'grid-cols-2' : 'grid-cols-1')}>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Titular</Label>
                <Input
                  value={form.holderName}
                  placeholder={isCard ? 'Nome no cartão' : 'Nome completo'}
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

            {/* Actions */}
            <div className="-mx-5 -mb-5 flex justify-end gap-2 border-t bg-muted/50 px-5 py-3 rounded-b-xl">
              <Button
                variant="ghost"
                type="button"
                className="cursor-pointer"
                onClick={cancelForm}
                disabled={isAdding}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="cursor-pointer gap-2"
                onClick={handleAddMethod}
                disabled={isAdding}
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {isAdding ? 'Salvando...' : 'Salvar método'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Methods list */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
        <CardContent className="p-5">{renderList()}</CardContent>
      </Card>
    </div>
  );
}
