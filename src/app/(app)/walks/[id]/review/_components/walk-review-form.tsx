"use client";

import { useState } from "react";
import { MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { FlowActions } from "@/components/common/flow-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, TOUCH_TARGET } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSubmitReview } from "@/features/reviews/hooks/use-reviews";
import type { WalkReview } from "@/types";

interface WalkReviewFormProps {
  walkId: string;
  walkerId: string;
  walkDate: string;
  walkerName: string;
  petNames: string[];
  existingReview?: WalkReview;
}

export function WalkReviewForm({
  walkId,
  walkerId,
  walkDate,
  walkerName,
  petNames,
  existingReview,
}: WalkReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [editing, setEditing] = useState(!existingReview);

  const { mutate: submitReview, isPending } = useSubmitReview(walkId, walkerId);

  function handleSave() {
    if (rating < 1) {
      toast.error("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    submitReview(
      { rating, comment, isUpdate: Boolean(existingReview) },
      {
        onSuccess: () => {
          setEditing(false);
          toast.success(
            existingReview ? "Avaliacao atualizada com sucesso." : "Avaliacao enviada com sucesso."
          );
          if (!existingReview) router.push(`/walks/${walkId}`);
        },
        onError: () => {
          toast.error("Erro ao salvar avaliacao. Tente novamente.");
        },
      }
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title={`Avaliacao do passeio #${walkId}`}
        description={`Passeador: ${walkerName} · ${walkDate}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
          <CardDescription>
            {petNames.join(", ")} · passeador {walkerName}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Passeio concluido</Badge>
          {existingReview && !editing && <Badge variant="success">Avaliacao registrada</Badge>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Como foi a experiencia?" : "Sua avaliacao"}</CardTitle>
          <CardDescription>
            Sua opiniao ajuda outros clientes a escolherem o passeador ideal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Nota</Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => {
                const current = index + 1;
                return (
                  <button
                    key={current}
                    type="button"
                    onClick={() => editing && setRating(current)}
                    className={cn(
                      "relative rounded-md p-1 transition",
                      editing ? "hover:scale-105" : "cursor-default",
                      TOUCH_TARGET,
                    )}
                    aria-label={`Dar nota ${current}`}
                  >
                    <Star
                      className={cn(
                        "h-7 w-7",
                        current <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40"
                      )}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 ? `${rating}/5` : "Sem nota"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment">Comentario</Label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={!editing}
              placeholder="Conte como foi o passeio, comunicacao, cuidado com o pet e pontualidade."
              className="min-h-[130px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {!editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Editar avaliacao
            </Button>
          )}

          {editing && (
            <FlowActions
              showBack
              backHref={`/walks/${walkId}`}
              cancelHref="/walks"
              primaryLabel="Concluir avaliacao"
              onPrimary={handleSave}
              primaryDisabled={isPending || rating < 1}
              primaryLoading={isPending}
              primaryVariant="success"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
