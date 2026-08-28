import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import EvidenceDetailsPanel from "../../components/evidence/EvidenceDetailsPanel";
import { EvidenceRepository } from "../../repositories";
import type { EvidenceRecord } from "../../services";
import VaultBackupActions from "./VaultBackupActions";
import VaultImportPreview from "./VaultImportPreview";
import {
  buildEvidenceIndex,
  DEFAULT_VAULT_PAGE_SIZE,
  filterAndSortEvidenceIndex,
  paginateEvidenceIndex,
  VAULT_HISTORY_PAGE_SIZE,
  type VaultSortOrder,
  type VaultStatusFilter,
} from "./VaultIndex";
import "./VaultPage.css";

function shorten(value: string): string {
  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function VaultPage() {
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<VaultStatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<VaultSortOrder>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedHash, setSelectedHash] = useState<string>("");
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const deferredSearchText = useDeferredValue(searchText);

  async function reloadRecords(): Promise<void> {
    const repositoryRecords = await EvidenceRepository.listAsync();
    setRecords(repositoryRecords);
  }

  useEffect(() => {
    let mounted = true;

    async function loadInitialRecords(): Promise<void> {
      const repositoryRecords = await EvidenceRepository.listAsync();

      if (mounted) {
        setRecords(repositoryRecords);
      }
    }

    void loadInitialRecords();

    const unsubscribe = EvidenceRepository.subscribe((repositoryRecords) => {
      if (mounted) {
        setRecords(repositoryRecords);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const evidenceIndex = useMemo(() => buildEvidenceIndex(records), [records]);

  const filteredIndex = useMemo(
    () =>
      filterAndSortEvidenceIndex(
        evidenceIndex,
        deferredSearchText,
        statusFilter,
        sortOrder
      ),
    [deferredSearchText, evidenceIndex, sortOrder, statusFilter]
  );

  const pagination = useMemo(
    () =>
      paginateEvidenceIndex(
        filteredIndex,
        currentPage,
        DEFAULT_VAULT_PAGE_SIZE
      ),
    [currentPage, filteredIndex]
  );

  const selectedItem =
    pagination.items.find((item) => item.hashValue === selectedHash) ??
    pagination.items[0] ??
    null;

  const historyTotalPages = selectedItem
    ? Math.max(
        1,
        Math.ceil(selectedItem.records.length / VAULT_HISTORY_PAGE_SIZE)
      )
    : 1;
  const visibleHistoryPage = Math.min(historyPage, historyTotalPages);
  const visibleHistory = selectedItem
    ? selectedItem.records.slice(
        (visibleHistoryPage - 1) * VAULT_HISTORY_PAGE_SIZE,
        visibleHistoryPage * VAULT_HISTORY_PAGE_SIZE
      )
    : [];

  function resetBrowsing(): void {
    setCurrentPage(1);
    setSelectedHash("");
    setDetailOpen(false);
  }

  function selectDocument(hashValue: string): void {
    setSelectedHash(hashValue);
    setHistoryPage(1);
    setDetailOpen(true);
  }

  function changePage(page: number): void {
    setCurrentPage(page);
    setSelectedHash("");
    setHistoryPage(1);
    setDetailOpen(false);
  }

  const draftCount = records.filter((record) => record.status === "draft").length;
  const confirmedCount = records.filter((record) => record.status === "confirmed").length;

  return (
    <section className="page vault-page">
      <div className="vault-header">
        <p className="vault-eyebrow">Evidence Repository</p>
        <h2>Evidence Vault</h2>

        <p>
          Review cryptographic evidence records organized by unique
          document fingerprint. The Vault stores evidence metadata and
          blockchain references, not the original documents.
        </p>

        <div className="vault-boundary-summary">
          <span>Evidence records: Stored locally</span>
          <span>Original documents: Not stored</span>
          <span>Fingerprint: SHA-256</span>
        </div>
      </div>

      <VaultBackupActions />
      <VaultImportPreview onImportComplete={reloadRecords} />

      <div className="vault-stats">
        <div>
          <span>Total Records</span>
          <strong>{records.length}</strong>
        </div>

        <div>
          <span>Unique Documents</span>
          <strong>{evidenceIndex.length}</strong>
        </div>

        <div>
          <span>Drafts</span>
          <strong>{draftCount}</strong>
        </div>

        <div>
          <span>Confirmed</span>
          <strong>{confirmedCount}</strong>
        </div>
      </div>

      <div className="vault-toolbar">
        <label className="visually-hidden" htmlFor="vault-search">
          Search evidence by filename or fingerprint
        </label>
        <input
          id="vault-search"
          type="search"
          placeholder="Search by filename or hash..."
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value);
            resetBrowsing();
          }}
        />

        <label className="visually-hidden" htmlFor="vault-status-filter">
          Filter evidence by status
        </label>
        <select
          id="vault-status-filter"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as VaultStatusFilter);
            resetBrowsing();
          }}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="signed">Signed</option>
          <option value="submitted">Submitted</option>
          <option value="confirmed">Confirmed</option>
          <option value="failed">Failed</option>
        </select>

        <label className="visually-hidden" htmlFor="vault-sort-order">
          Sort evidence documents
        </label>
        <select
          id="vault-sort-order"
          value={sortOrder}
          onChange={(event) => {
            setSortOrder(event.target.value as VaultSortOrder);
            resetBrowsing();
          }}
        >
          <option value="newest">Newest updated</option>
          <option value="oldest">Oldest updated</option>
          <option value="filename">Filename A-Z</option>
          <option value="status">Status</option>
          <option value="confirmation-round">Confirmation round</option>
        </select>
      </div>

      {records.length === 0 ? (
        <div className="vault-empty">
          <strong>No evidence records yet.</strong>
          <p>Create a proof on the Notarize page to add a local evidence record.</p>
        </div>
      ) : filteredIndex.length === 0 ? (
        <div className="vault-empty">
          <strong>No matching evidence records.</strong>
          <p>Try changing the search text or status filter.</p>
        </div>
      ) : (
        <div
          className={
            detailOpen
              ? "evidence-workspace detail-open"
              : "evidence-workspace"
          }
        >
          <aside className="evidence-index" aria-label="Document fingerprints">
            <div className="evidence-index-header">
              <h3>Document Fingerprints</h3>
              <p>
                Select a fingerprint to inspect its latest evidence
                record and history.
              </p>
              <p className="evidence-index-range" role="status">
                Showing{" "}
                {(pagination.page - 1) * pagination.pageSize + 1}–
                {Math.min(
                  pagination.page * pagination.pageSize,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems.toLocaleString()} documents
              </p>
            </div>

            <div className="evidence-index-list">
              {pagination.items.map((item) => (
                <button
                  className={
                    selectedItem?.hashValue === item.hashValue
                      ? "evidence-index-item active"
                      : "evidence-index-item"
                  }
                  key={item.hashValue}
                  type="button"
                  onClick={() => selectDocument(item.hashValue)}
                >
                  <strong>{item.documentName}</strong>
                  <span>Status: {item.latestRecord.status}</span>
                  <span>{item.records.length} evidence records</span>
                  <span>
                    Last Updated:{" "}
                    {new Date(item.latestRecord.createdAt).toLocaleDateString()}
                  </span>
                  <code>{shorten(item.hashValue)}</code>
                </button>
              ))}
            </div>

            <nav className="vault-pagination" aria-label="Vault document pages">
              <button
                type="button"
                disabled={pagination.page === 1}
                onClick={() => changePage(pagination.page - 1)}
              >
                Previous
              </button>
              <span>
                Page {pagination.page.toLocaleString()} of{" "}
                {pagination.totalPages.toLocaleString()}
              </span>
              <button
                type="button"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => changePage(pagination.page + 1)}
              >
                Next
              </button>
            </nav>
          </aside>

          <div className="evidence-workspace-detail">
            {selectedItem && (
              <>
                <button
                  className="vault-mobile-back"
                  type="button"
                  onClick={() => setDetailOpen(false)}
                >
                  Back to document list
                </button>
                <div className="evidence-workspace-summary">
                  <p className="vault-index-label">Selected Unique Document Fingerprint</p>
                  <h3>{selectedItem.documentName}</h3>
                  <p>Evidence records for this fingerprint: {selectedItem.records.length}</p>
                  <code>{selectedItem.hashValue}</code>
                </div>

                <EvidenceDetailsPanel record={selectedItem.latestRecord} />

                <div className="evidence-history">
                  <div className="evidence-history-header">
                    <div>
                      <h3>Evidence Record History</h3>
                      <p>
                        Chronological evidence records sharing this exact
                        document fingerprint.
                      </p>
                    </div>

                    <span>
                      {selectedItem.records.length} record
                      {selectedItem.records.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {visibleHistory.map((record) => (
                    <div className="evidence-history-item" key={record.id}>
                      <div className="evidence-history-status">
                        <strong>{record.status}</strong>
                      </div>

                      <div className="evidence-history-meta">
                        <div>
                          <span>Created</span>
                          <strong>
                            {new Date(record.createdAt).toLocaleString()}
                          </strong>
                        </div>

                        <div>
                          <span>Submitted</span>
                          <strong>
                            {record.submittedAt
                              ? new Date(record.submittedAt).toLocaleString()
                              : "Not submitted"}
                          </strong>
                        </div>

                        <div>
                          <span>Confirmed</span>
                          <strong>
                            {record.confirmedAt
                              ? new Date(record.confirmedAt).toLocaleString()
                              : "Not confirmed"}
                          </strong>
                        </div>

                        <div>
                          <span>Confirmed Round</span>
                          <strong>
                            {record.confirmedRound ?? "Pending"}
                          </strong>
                        </div>
                      </div>

                      <div className="evidence-history-record-id">
                        <span>Record ID</span>
                        <code>{shorten(record.id)}</code>
                      </div>
                    </div>
                  ))}

                  {historyTotalPages > 1 && (
                    <nav
                      className="vault-pagination"
                      aria-label="Evidence history pages"
                    >
                      <button
                        type="button"
                        disabled={visibleHistoryPage === 1}
                        onClick={() => setHistoryPage(visibleHistoryPage - 1)}
                      >
                        Previous history
                      </button>
                      <span>
                        History page {visibleHistoryPage.toLocaleString()} of{" "}
                        {historyTotalPages.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        disabled={visibleHistoryPage === historyTotalPages}
                        onClick={() => setHistoryPage(visibleHistoryPage + 1)}
                      >
                        Next history
                      </button>
                    </nav>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default VaultPage;





