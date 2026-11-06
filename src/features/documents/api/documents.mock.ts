import { documentStatus as seedStatus, walkerCertificates } from "@/lib/mock/mock-data";
import type { DocumentsStatus, WalkerCertDocument, DocStatus } from "@/types";

// In-memory mock backend, loaded only when no real API is configured.
let statusStore: DocumentsStatus | null = null;

function getStatusStore(): DocumentsStatus {
  if (!statusStore) {
    statusStore = { ...seedStatus, certificates: [...walkerCertificates] };
  }
  return statusStore;
}

export const documentsMock = {
  getStatus: async (): Promise<DocumentsStatus> => {
    const store = getStatusStore();
    return { ...store, certificates: [...store.certificates] };
  },

  uploadIdentity: async (): Promise<void> => {
    const store = getStatusStore();
    await new Promise((r) => setTimeout(r, 600));
    statusStore = { ...store, identity: "pending" };
  },

  uploadBackground: async (): Promise<void> => {
    const store = getStatusStore();
    await new Promise((r) => setTimeout(r, 600));
    statusStore = { ...store, background: "pending" };
  },

  addCertificate: async (title: string, file: File): Promise<WalkerCertDocument> => {
    const store = getStatusStore();
    await new Promise((r) => setTimeout(r, 400));
    const entry: WalkerCertDocument = {
      id: crypto.randomUUID(),
      title,
      fileName: file.name,
      status: "pending" as DocStatus,
    };
    statusStore = {
      ...store,
      certificates: [...store.certificates, entry],
    };
    return entry;
  },

  removeCertificate: async (id: string): Promise<void> => {
    const store = getStatusStore();
    statusStore = {
      ...store,
      certificates: store.certificates.filter((c) => c.id !== id),
    };
  },
};
