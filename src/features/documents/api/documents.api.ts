import type { DocumentsStatus, WalkerCertDocument } from "@/types";
import api, { isApiConfigured } from "@/services/api";

// The in-memory mock lives in documents.mock.ts and is loaded dynamically so it
// (and mock-data) never reaches the client bundle when a real API is configured.
export const DocumentsApi = {
  getStatus: async (): Promise<DocumentsStatus> => {
    if (!isApiConfigured) {
      const { documentsMock } = await import("./documents.mock");
      return documentsMock.getStatus();
    }
    return api.get<DocumentsStatus>("/profile/documents").then((r) => r.data);
  },

  uploadIdentity: async (doc: File, selfie: File): Promise<void> => {
    if (!isApiConfigured) {
      const { documentsMock } = await import("./documents.mock");
      return documentsMock.uploadIdentity();
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
      const { documentsMock } = await import("./documents.mock");
      return documentsMock.uploadBackground();
    }
    const form = new FormData();
    form.append("document", doc);
    await api.post("/profile/documents/background", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  addCertificate: async (title: string, file: File): Promise<WalkerCertDocument> => {
    if (!isApiConfigured) {
      const { documentsMock } = await import("./documents.mock");
      return documentsMock.addCertificate(title, file);
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
      const { documentsMock } = await import("./documents.mock");
      return documentsMock.removeCertificate(id);
    }
    await api.delete(`/profile/documents/certificates/${id}`);
  },
};
