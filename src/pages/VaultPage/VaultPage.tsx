import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import EvidenceDetailsPanel from "../../components/evidence/EvidenceDetailsPanel";
import ShareVerificationActions from "../../components/verification/ShareVerificationActions";
import { EvidenceRepository } from "../../repositories";
import {
  AlgorandExplorerService,
  type EvidenceRecord,
} from "../../services";
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
  const [toolsOpen, setToolsOpen] = useState<boolean>(false);
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

  const selectedItem = selectedHash
    ? pagination.items.find((item) => item.hashValue === selectedHash) ?? null
    : null;
  const selectedConfirmedRecord = selectedItem?.records.find(
    (record) =>
      record.status === "confirmed" &&
      Boolean(record.algorandTransactionId) &&
      Boolean(record.confirmedRound)
  ) ?? null;
  const selectedExplorerUrl = selectedConfirmedRecord?.algorandTransactionId
    ? AlgorandExplorerService.getTransactionUrl(
        selectedConfirmedRecord.algorandTransactionId
      )
    : null;

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

        <p>Search and review document fingerprints stored on this device.</p>

      </div>

      <div className="vault-summary-strip" aria-label="Vault summary">
          <span>
            <strong>{evidenceIndex.length}</strong> documents
          </span>
          <span>
            <strong>{records.length}</strong> evidence records
          </span>
          <span>
            <strong>{confirmedCount}</strong> confirmed
          </span>
          <span>
            <strong>{draftCount}</strong> drafts
          </span>
      </div>

      <details
        className="vault-tools"
        open={toolsOpen}
      >
        <summary
          onClick={(event) => {
            event.preventDefault();
            setToolsOpen((isOpen) => !isOpen);
          }}
        >
          <span>
            <strong>Restore records</strong>
            <small>Import records from an Evidence Vault backup</small>
          </span>
          <span className="vault-tools-action">
            {toolsOpen ? "Close" : "Restore"}
          </span>
        </summary>

        <div className="vault-tools-content">
          <VaultImportPreview onImportComplete={reloadRecords} />
        </div>
      </details>

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
              <h3>Documents</h3>
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

            <div className="evidence-index-body">
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
                  aria-pressed={selectedItem?.hashValue === item.hashValue}
                  onClick={() => selectDocument(item.hashValue)}
                >
                  <span className="evidence-index-item-heading">
                    <strong>{item.documentName}</strong>
                    <span className={`evidence-status ${item.latestRecord.status}`}>
                      <span className="visually-hidden">Status: </span>
                      {item.latestRecord.status}
                    </span>
                  </span>
                  <code>{shorten(item.hashValue)}</code>
                  <span className="evidence-index-item-meta">
                    <span>
                      {item.records.length} evidence record
                      {item.records.length === 1 ? "" : "s"}
                    </span>
                  </span>
                </button>
                ))}
              </div>

              {!detailOpen && (
                <VaultBackupActions recordCount={records.length} />
              )}
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

          {selectedItem && (
            <div
              className="evidence-workspace-detail"
              key={selectedItem.hashValue}
            >
              <>
                <button
                  className="vault-mobile-back"
                  type="button"
                  onClick={() => {
                    setSelectedHash("");
                    setDetailOpen(false);
                  }}
                >
                  Back to document list
                </button>
                <div className="evidence-workspace-summary">
                  <div className="vault-selected-heading">
                    <div>
                      <p className="vault-index-label">Selected document</p>
                      <h3>{selectedItem.documentName}</h3>
                    </div>
                    <span
                      className={`evidence-status ${selectedItem.latestRecord.status}`}
                    >
                      {selectedItem.latestRecord.status}
                    </span>
                  </div>

                  <dl className="vault-document-receipt">
                    <div>
                      <dt>Fingerprint</dt>
                      <dd>
                        <code
                          title={selectedItem.hashValue}
                          aria-label={`Fingerprint ${selectedItem.hashValue}`}
                        >
                          {shorten(selectedItem.hashValue)}
                        </code>
                      </dd>
                    </div>
                    <div>
                      <dt>Evidence records</dt>
                      <dd>{selectedItem.records.length}</dd>
                    </div>
                    <div>
                      <dt>Latest update</dt>
                      <dd>
                        <time
                          dateTime={selectedItem.latestRecord.createdAt}
                          title={new Date(
                            selectedItem.latestRecord.createdAt
                          ).toLocaleString()}
                        >
                          {new Date(
                            selectedItem.latestRecord.createdAt
                          ).toLocaleDateString()}
                        </time>
                      </dd>
                    </div>
                    <div>
                      <dt>Record ID</dt>
                      <dd>
                        <code
                          title={selectedItem.latestRecord.id}
                          aria-label={`Record ID ${selectedItem.latestRecord.id}`}
                        >
                          {shorten(selectedItem.latestRecord.id)}
                        </code>
                      </dd>
                    </div>
                  </dl>

                  {selectedConfirmedRecord && (
                    <div className="vault-selected-actions">
                      {selectedExplorerUrl && (
                        <a
                          className="explorer-link"
                          href={selectedExplorerUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View confirmed transaction
                        </a>
                      )}
                      <ShareVerificationActions
                        key={selectedConfirmedRecord.id}
                        record={selectedConfirmedRecord}
                      />
                    </div>
                  )}
                </div>

                <details className="vault-detail-disclosure">
                  <summary>
                    <span>
                      <strong>Technical evidence</strong>
                      <small>Fingerprint, blockchain metadata, and proof boundary</small>
                    </span>
                    <span className="vault-detail-disclosure-action">
                      Open
                    </span>
                  </summary>
                  <EvidenceDetailsPanel record={selectedItem.latestRecord} />
                </details>

                <details className="vault-detail-disclosure">
                  <summary>
                    <span>
                      <strong>Evidence history</strong>
                      <small>Chronological records for this fingerprint</small>
                    </span>
                    <span className="vault-detail-disclosure-action">
                      {selectedItem.records.length} record
                      {selectedItem.records.length === 1 ? "" : "s"}
                    </span>
                  </summary>

                  <div className="evidence-history">

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
                </details>
              </>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default VaultPage;





