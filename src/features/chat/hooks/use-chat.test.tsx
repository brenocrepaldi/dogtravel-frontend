import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useChat, useSendMessage } from "./use-chat";
import { ChatApi, type ChatMsg } from "../api/chat.api";
import { createSocket } from "@/lib/socket";

vi.mock("../api/chat.api", () => ({
  ChatApi: {
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

vi.mock("@/lib/socket", () => ({
  createSocket: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  getSession: vi.fn(() => Promise.resolve({ accessToken: "fake-token" })),
}));

const getMessagesMock = vi.mocked(ChatApi.getMessages);
const sendMessageMock = vi.mocked(ChatApi.sendMessage);
const createSocketMock = vi.mocked(createSocket);

// Fake socket.io client: registers/replays handlers synchronously so tests can
// drive "connect"/"new-message" events without a real WebSocket connection.
function createFakeSocket() {
  const handlers: Record<string, ((...args: unknown[]) => void)[]> = {};
  return {
    on: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
      (handlers[event] ??= []).push(cb);
    }),
    emit: vi.fn(),
    disconnect: vi.fn(),
    trigger(event: string, ...args: unknown[]) {
      handlers[event]?.forEach((cb) => cb(...args));
    },
  };
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useSendMessage (optimistic update)", () => {
  beforeEach(() => {
    sendMessageMock.mockReset();
  });

  it("mostra a mensagem otimisticamente antes da resposta do servidor", async () => {
    let resolveSend!: (msg: ChatMsg) => void;
    sendMessageMock.mockReturnValue(
      new Promise<ChatMsg>((resolve) => {
        resolveSend = resolve;
      }),
    );

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData<ChatMsg[]>(["chat", "walk-1"], []);

    const { result } = renderHook(() => useSendMessage("walk-1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ senderId: "client-1", text: "Chegando em 5 min" });

    await waitFor(() => {
      const cached = queryClient.getQueryData<ChatMsg[]>(["chat", "walk-1"]);
      expect(cached).toHaveLength(1);
      expect(cached?.[0]?.text).toBe("Chegando em 5 min");
      expect(cached?.[0]?.id).toMatch(/^optimistic-/);
    });

    resolveSend({
      id: "real-id-1",
      senderId: "client-1",
      text: "Chegando em 5 min",
      sentAt: new Date().toISOString(),
      read: false,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("desfaz a mensagem otimista se o envio falhar", async () => {
    sendMessageMock.mockRejectedValue(new Error("network error"));

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData<ChatMsg[]>(["chat", "walk-1"], []);

    const { result } = renderHook(() => useSendMessage("walk-1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ senderId: "client-1", text: "vai falhar" });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryClient.getQueryData<ChatMsg[]>(["chat", "walk-1"])).toEqual([]);
  });
});

describe("useChat (subscrição via WebSocket)", () => {
  beforeEach(() => {
    getMessagesMock.mockReset().mockResolvedValue([]);
    createSocketMock.mockReset();
  });

  it("entra na sala do walk (join-walk) assim que o socket conecta", async () => {
    const fakeSocket = createFakeSocket();
    createSocketMock.mockReturnValue(fakeSocket as never);

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderHook(() => useChat("walk-1"), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(createSocketMock).toHaveBeenCalledWith("/chat", "fake-token"));

    fakeSocket.trigger("connect");

    expect(fakeSocket.emit).toHaveBeenCalledWith("join-walk", "walk-1");
  });

  it("adiciona mensagens recebidas via socket ao cache, sem duplicar por id", async () => {
    const fakeSocket = createFakeSocket();
    createSocketMock.mockReturnValue(fakeSocket as never);

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderHook(() => useChat("walk-1"), { wrapper: createWrapper(queryClient) });

    await waitFor(() => expect(createSocketMock).toHaveBeenCalled());

    const incoming: ChatMsg = {
      id: "msg-1",
      senderId: "walker-1",
      text: "Chegando",
      sentAt: new Date().toISOString(),
      read: false,
    };

    fakeSocket.trigger("new-message", incoming);
    fakeSocket.trigger("new-message", incoming); // duplicado — mesmo id

    const cached = queryClient.getQueryData<ChatMsg[]>(["chat", "walk-1"]);
    expect(cached).toHaveLength(1);
    expect(cached?.[0]).toEqual(incoming);
  });

  it("expõe connected refletindo o estado do socket (connect/disconnect)", async () => {
    const fakeSocket = createFakeSocket();
    createSocketMock.mockReturnValue(fakeSocket as never);

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    const { result } = renderHook(() => useChat("walk-1"), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.connected).toBe(false);

    await waitFor(() => expect(createSocketMock).toHaveBeenCalledWith("/chat", "fake-token"));
    fakeSocket.trigger("connect");
    await waitFor(() => expect(result.current.connected).toBe(true));

    fakeSocket.trigger("disconnect");
    await waitFor(() => expect(result.current.connected).toBe(false));
  });
});
