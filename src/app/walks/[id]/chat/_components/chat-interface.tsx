"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useChat, useSendMessage } from "@/features/chat/hooks/use-chat";
import { useWalkById } from "@/features/walks/hooks/use-walks";

export function ChatInterface({
  walkId,
  currentUserId,
}: {
  walkId: string;
  currentUserId: string;
}) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data: walk } = useWalkById(walkId);
  const { data: messages = [], isLoading } = useChat(walkId);
  const { mutate: send, isPending: isSending } = useSendMessage(walkId);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const otherParticipant = walk?.participants.find((p) => p.id !== currentUserId);
  const otherName = otherParticipant?.name ?? "Participante";
  const otherInitial = otherName.charAt(0).toUpperCase();

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    send(
      { senderId: currentUserId, text: input.trim() },
      { onSuccess: () => setInput("") }
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      {/* ─── Header ─── */}
      <div className="flex items-center p-4 border-b border-border bg-background z-10">
        <Link
          href={walk?.status === "in_progress" ? `/walks/${walkId}/tracking` : `/walks/${walkId}`}
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "mr-2 shrink-0")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {otherInitial}
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">{otherName}</h2>
            <p className="text-xs text-green-500 font-medium tracking-tight">
              {walk?.status === "in_progress" ? "Passeio em andamento" : "Passeio"}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Messages Area ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Inicie a conversa.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          const time = new Date(msg.sentAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[80%]",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-[15px] shadow-sm leading-relaxed",
                  isMe
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-background border border-border text-foreground rounded-tl-sm"
                )}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 mx-1">{time}</span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* ─── Input Area ─── */}
      <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-border bg-background">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="resize-none pr-10 min-h-[44px] rounded-xl border-border focus-visible:ring-primary shadow-sm"
              autoComplete="off"
              disabled={isSending}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isSending}
            className="shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-50"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
