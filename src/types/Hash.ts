export type HashAlgorithm = "SHA-256";

export type DocumentHash = {
  algorithm: HashAlgorithm;
  value: string;
};
