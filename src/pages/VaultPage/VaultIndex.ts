import type { EvidenceRecord } from "../../services";

export const DEFAULT_VAULT_PAGE_SIZE = 50;
export const VAULT_HISTORY_PAGE_SIZE = 25;
export const SUPPORTED_VAULT_RECORD_LIMIT = 10_000;
export const VAULT_RECORD_WARNING_THRESHOLD = 8_000;

export type VaultStatusFilter =
  | "all"
  | "draft"
  | "signed"
  | "submitted"
  | "confirmed"
  | "failed";

export type VaultSortOrder =
  | "newest"
  | "oldest"
  | "filename"
  | "status"
  | "confirmation-round";

export type EvidenceIndexItem = {
  hashValue: string;
  normalizedHashValue: string;
  documentName: string;
  normalizedDocumentName: string;
  latestCreatedAtMs: number;
  latestRecord: EvidenceRecord;
  records: EvidenceRecord[];
};

export type PaginatedEvidenceIndex = {
  items: EvidenceIndexItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

function createdAt(record: EvidenceRecord): number {
  return new Date(record.createdAt).getTime();
}

export function buildEvidenceIndex(
  records: EvidenceRecord[]
): EvidenceIndexItem[] {
  const grouped = new Map<string, EvidenceRecord[]>();
  const timestamps = new Map<string, number>();

  for (const record of records) {
    timestamps.set(record.id, createdAt(record));
    const existing = grouped.get(record.hashValue) ?? [];
    existing.push(record);
    grouped.set(record.hashValue, existing);
  }

  return Array.from(grouped.entries()).map(([hashValue, group]) => {
    const sorted = [...group].sort(
      (first, second) =>
        (timestamps.get(second.id) ?? 0) - (timestamps.get(first.id) ?? 0)
    );
    const documentName = sorted[0].documentName;

    return {
      hashValue,
      normalizedHashValue: hashValue.toLowerCase(),
      documentName,
      normalizedDocumentName: documentName.toLowerCase(),
      latestCreatedAtMs: timestamps.get(sorted[0].id) ?? 0,
      latestRecord: sorted[0],
      records: sorted,
    };
  });
}

export function filterAndSortEvidenceIndex(
  index: EvidenceIndexItem[],
  searchText: string,
  statusFilter: VaultStatusFilter,
  sortOrder: VaultSortOrder
): EvidenceIndexItem[] {
  const normalizedSearch = searchText.trim().toLowerCase();

  const filtered = index.filter((item) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      item.normalizedDocumentName.includes(normalizedSearch) ||
      item.normalizedHashValue.includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" || item.latestRecord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return filtered.sort((first, second) => {
    const comparison = (() => {
      if (sortOrder === "oldest") {
        return first.latestCreatedAtMs - second.latestCreatedAtMs;
      }

      if (sortOrder === "filename") {
        return first.documentName.localeCompare(second.documentName);
      }

      if (sortOrder === "status") {
        return first.latestRecord.status.localeCompare(
          second.latestRecord.status
        );
      }

      if (sortOrder === "confirmation-round") {
        return (
        (second.latestRecord.confirmedRound ?? -1) -
          (first.latestRecord.confirmedRound ?? -1)
        );
      }

      return second.latestCreatedAtMs - first.latestCreatedAtMs;
    })();

    return comparison || first.documentName.localeCompare(second.documentName);
  });
}

export function paginateEvidenceIndex(
  index: EvidenceIndexItem[],
  requestedPage: number,
  pageSize = DEFAULT_VAULT_PAGE_SIZE
): PaginatedEvidenceIndex {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(1, Math.ceil(index.length / safePageSize));
  const page = Math.min(Math.max(1, Math.floor(requestedPage)), totalPages);
  const start = (page - 1) * safePageSize;

  return {
    items: index.slice(start, start + safePageSize),
    page,
    pageSize: safePageSize,
    totalItems: index.length,
    totalPages,
  };
}
