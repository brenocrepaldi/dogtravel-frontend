export type DocStatus = "idle" | "pending" | "verified" | "rejected";

export interface WalkerCertDocument {
  id: string;
  title: string;
  fileName: string;
  status: DocStatus;
}

export interface DocumentsStatus {
  identity: DocStatus;
  background: DocStatus;
  certificates: WalkerCertDocument[];
}
