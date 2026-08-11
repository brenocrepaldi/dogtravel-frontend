import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession } from "next-auth/react";
import type { Socket } from "socket.io-client";
import { createSocket } from "@/lib/socket";
import { ChatApi, type ChatMsg } from "../api/chat.api";

export function useChat(walkId: string) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!walkId) return;

    let cancelled = false;

    (async () => {
      const session = await getSession();
      const token = session?.accessToken;
      if (!token || cancelled) return;

      const socket = createSocket("/chat", token);
      socketRef.current = socket;

      socket.on("connect", () => {
        setConnected(true);
        socket.emit("join-walk", walkId);
      });

      socket.on("disconnect", () => setConnected(false));

      socket.on("new-message", (message: ChatMsg) => {
        queryClient.setQueryData<ChatMsg[]>(["chat", walkId], (prev) => {
          if (prev?.some((m) => m.id === message.id)) return prev;
          return [...(prev ?? []), message];
        });
      });
    })();

    return () => {
      cancelled = true;
      const socket = socketRef.current;
      if (socket) {
        socket.emit("leave-walk", walkId);
        socket.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
    };
  }, [walkId, queryClient]);

  return useQuery({
    queryKey: ["chat", walkId],
    queryFn: () => ChatApi.getMessages(walkId),
    enabled: Boolean(walkId),
    // Socket subscription above keeps this fresh in real time; poll only
    // as a fallback while the socket isn't connected.
    refetchInterval: connected ? false : 5_000,
    staleTime: 0,
  });
}

export function useSendMessage(walkId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["chat", walkId];

  return useMutation({
    mutationFn: ({ senderId, text }: { senderId: string; text: string }) =>
      ChatApi.sendMessage(walkId, senderId, text),

    onMutate: async ({ senderId, text }) => {
      // Cancel any in-flight refetch so it doesn't overwrite our optimistic entry
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<ChatMsg[]>(queryKey);

      const optimisticMsg: ChatMsg = {
        id: `optimistic-${Date.now()}`,
        senderId,
        text,
        sentAt: new Date().toISOString(),
        read: false,
      };

      queryClient.setQueryData<ChatMsg[]>(queryKey, (prev) => [
        ...(prev ?? []),
        optimisticMsg,
      ]);

      return { previous };
    },

    onError: (_err, _vars, context) => {
      // Roll back to the pre-mutation snapshot on failure
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    onSettled: () => {
      // Always sync with the server to replace the optimistic entry with the real one
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
