import type { EvidenceRecord } from "../../services";

export const DEFAULT_VAULT_PAGE_SIZE = 50;
export const VAULT_HISTORY_PAGE_SIZE = 25;

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
  documentName: string;
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

  for (const record of records) {
    const existing = grouped.get(record.hashValue) ?? [];
    existing.push(record);
    grouped.set(record.hashValue, existing);
  }

  return Array.from(grouped.entries()).map(([hashValue, group]) => {
    const sorted = [...group].sort(
      (first, second) => createdAt(second) - createdAt(first)
    );

    return {
      hashValue,
      documentName: sorted[0].documentName,
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
      item.documentName.toLowerCase().includes(normalizedSearch) ||
      item.hashValue.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" || item.latestRecord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return filtered.sort((first, second) => {
    const comparison = (() => {
      if (sortOrder === "oldest") {
        return createdAt(first.latestRecord) - createdAt(second.latestRecord);
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

      return createdAt(second.latestRecord) - createdAt(first.latestRecord);
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
