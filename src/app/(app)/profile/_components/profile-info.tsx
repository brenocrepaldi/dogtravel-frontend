'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, TOUCH_TARGET } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PET_IMAGE_ACCEPT, validatePetImage } from '@/lib/validations/pet';
import { profileSchema, type ProfileFormValues } from '@/lib/validations/profile';
import { cn } from '@/lib/utils';
import { Camera, Edit2, Mail, Phone, Save, User, X } from 'lucide-react';
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/features/profile/hooks/use-profile';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ReadonlyField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider leading-none mb-1">
          {label}
        </p>
        <p className="text-sm text-foreground font-medium truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

function EditField({
  id,
  label,
  icon,
  value,
  type = 'text',
  onChange,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  type?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
      >
        {label}
      </Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none">
          {icon}
        </div>
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 rounded-lg"
        />
      </div>
    </div>
  );
}

// ─── Profile skeleton ─────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="h-20 w-20 rounded-full bg-muted" />
        <div className="space-y-1.5 text-center">
          <div className="h-4 w-32 rounded bg-muted mx-auto" />
          <div className="h-3 w-44 rounded bg-muted mx-auto" />
        </div>
      </div>
      <div className="rounded-xl border bg-card h-56" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProfileInfo() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState('');

  const { data: profile, isLoading } = useProfile();
  const { mutateAsync: saveProfileAsync, isPending: isSavingProfile } = useUpdateProfile();
  const { mutateAsync: uploadAvatarAsync, isPending: isUploading } = useUploadAvatar();
  const isSaving = isSavingProfile || isUploading;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  useEffect(() => {
    if (!profile) return;
    reset({ name: profile.name ?? '', email: profile.email ?? '', phone: profile.phone ?? '' });
  }, [profile, reset]);

  const watchedName = watch('name');
  const displayName = isEditing ? watchedName : (profile?.name ?? '');
  const displayImage = isEditing ? previewAvatarUrl || profile?.avatarUrl : profile?.avatarUrl;

  const processFile = (file: File) => {
    const error = validatePetImage(file);
    if (error) { toast.error(error); return; }
    setPendingAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setPreviewAvatarUrl(reader.result);
    };
    reader.onerror = () => toast.error('Não foi possível ler a imagem. Tente outro arquivo.');
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleEdit = () => {
    setPreviewAvatarUrl('');
    setPendingAvatarFile(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset({ name: profile?.name ?? '', email: profile?.email ?? '', phone: profile?.phone ?? '' });
    setPendingAvatarFile(null);
    setPreviewAvatarUrl('');
    setIsEditing(false);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      if (pendingAvatarFile) {
        await uploadAvatarAsync(pendingAvatarFile);
      }
      await saveProfileAsync(data);
      setPendingAvatarFile(null);
      setPreviewAvatarUrl('');
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch {
      toast.error('Erro ao salvar. Tente novamente.');
    }
  };

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="space-y-6">
      {/* ── Identidade ── */}
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="relative">
          <Avatar className="h-20 w-20 ring-2 ring-border/40 ring-offset-2 ring-offset-background shadow-sm">
            <AvatarImage src={displayImage} alt={displayName} />
            <AvatarFallback className="text-xl bg-primary/10 text-primary font-semibold">
              {getInitials(displayName) || '?'}
            </AvatarFallback>
          </Avatar>
          {isEditing && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={PET_IMAGE_ACCEPT}
                className="sr-only"
                onChange={handleFileChange}
                aria-label="Enviar foto de perfil"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md ring-2 ring-background hover:bg-primary/90 transition-colors cursor-pointer",
                  TOUCH_TARGET,
                )}
                aria-label="Trocar foto"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="text-center">
            <p className="text-base font-semibold text-foreground leading-tight">
              {profile?.name || 'Sem nome'}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{profile?.email}</p>
          </div>
        )}
      </div>

      {/* ── Card de contato ── */}
      <Card className="overflow-hidden py-0 gap-0">
        <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Informações de contato
            </span>
            {!isEditing && (
              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Editar
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="px-5">
              <ReadonlyField
                icon={<User className="w-4 h-4" />}
                label="Nome completo"
                value={profile?.name ?? ''}
              />
              <ReadonlyField
                icon={<Mail className="w-4 h-4" />}
                label="E-mail"
                value={profile?.email ?? ''}
              />
              <ReadonlyField
                icon={<Phone className="w-4 h-4" />}
                label="Telefone"
                value={profile?.phone ?? ''}
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="profile-name"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Nome completo
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <Input
                    id="profile-name"
                    {...register('name')}
                    className="pl-9 rounded-lg"
                    aria-invalid={!!errors.name}
                  />
                </div>
                {errors.name && (
                  <p className="text-destructive text-xs">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="profile-email"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  E-mail
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <Input
                    id="profile-email"
                    type="email"
                    {...register('email')}
                    className="pl-9 rounded-lg"
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-xs">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="profile-phone"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Telefone
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <Input
                    id="profile-phone"
                    {...register('phone')}
                    className="pl-9 rounded-lg"
                    aria-invalid={!!errors.phone}
                  />
                </div>
                {errors.phone && (
                  <p className="text-destructive text-xs">{errors.phone.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="rounded-lg gap-1.5 text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                  className="rounded-lg gap-1.5 shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
