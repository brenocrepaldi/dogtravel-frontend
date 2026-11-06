import type { DocumentsStatus, WalkerCertDocument, DocStatus } from "@/types";
import api, { isApiConfigured } from "@/services/api";

// Module-level mutable store — lazily populated via dynamic import so
// mock-data.ts never reaches the client bundle when a real API is configured.
let statusStore: DocumentsStatus | null = null;

async function getStatusStore(): Promise<DocumentsStatus> {
  if (!statusStore) {
    const { documentStatus: seedStatus, walkerCertificates } = await import("@/lib/mock-data");
    statusStore = { ...seedStatus, certificates: [...walkerCertificates] };
  }
  return statusStore;
}

export const DocumentsApi = {
  getStatus: async (): Promise<DocumentsStatus> => {
    if (!isApiConfigured) {
      const store = await getStatusStore();
      return { ...store, certificates: [...store.certificates] };
    }
    return api.get<DocumentsStatus>("/profile/documents").then((r) => r.data);
  },

  uploadIdentity: async (doc: File, selfie: File): Promise<void> => {
    if (!isApiConfigured) {
      const store = await getStatusStore();
      await new Promise((r) => setTimeout(r, 600));
      statusStore = { ...store, identity: "pending" };
      return;
    }
    const form = new FormData();
    form.append("document", doc);
    form.append("selfie", selfie);
    await api.post("/profile/documents/identity", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadBackground: async (doc: File): Promise<void> => {
    if (!isApiConfigured) {
      const store = await getStatusStore();
      await new Promise((r) => setTimeout(r, 600));
      statusStore = { ...store, background: "pending" };
      return;
    }
    const form = new FormData();
    form.append("document", doc);
    await api.post("/profile/documents/background", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  addCertificate: async (title: string, file: File): Promise<WalkerCertDocument> => {
    if (!isApiConfigured) {
      const store = await getStatusStore();
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
    }
    const form = new FormData();
    form.append("title", title);
    form.append("file", file);
    return api
      .post<WalkerCertDocument>("/profile/documents/certificates", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  removeCertificate: async (id: string): Promise<void> => {
    if (!isApiConfigured) {
      const store = await getStatusStore();
      statusStore = {
        ...store,
        certificates: store.certificates.filter((c) => c.id !== id),
      };
      return;
    }
    await api.delete(`/profile/documents/certificates/${id}`);
  },
};
