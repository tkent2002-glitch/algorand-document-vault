export type DocumentId = string;

export type VaultDocument = {
  id: DocumentId;
  name: string;
  size: number;
  mimeType: string;
  lastModified: number;
};
