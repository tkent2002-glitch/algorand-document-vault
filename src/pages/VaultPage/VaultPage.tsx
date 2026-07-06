import { useEffect, useMemo, useState } from "react";
import EvidenceDetailsPanel from "../../components/evidence/EvidenceDetailsPanel";
import { EvidenceRecordStoreService } from "../../services";
import type { EvidenceRecord } from "../../services";
import "./VaultPage.css";

type VaultStatusFilter = "all" | "draft" | "signed" | "submitted" | "confirmed" | "failed";

type EvidenceIndexItem = {
  hashValue: string;
  documentName: string;
  latestRecord: EvidenceRecord;
  records: EvidenceRecord[];
};

function buildEvidenceIndex(records: EvidenceRecord[]): EvidenceIndexItem[] {
  const grouped = new Map<string, EvidenceRecord[]>();

  for (const record of records) {
    const existing = grouped.get(record.hashValue) ?? [];
    existing.push(record);
    grouped.set(record.hashValue, existing);
  }

  return Array.from(grouped.entries()).map(([hashValue, group]) => {
    const sorted = [...group].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      hashValue,
      documentName: sorted[0].documentName,
      latestRecord: sorted[0],
      records: sorted,
    };
  });
}

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
  const [selectedHash, setSelectedHash] = useState<string>("");

  useEffect(() => {
    setRecords(EvidenceRecordStoreService.list());
  }, []);

  const evidenceIndex = useMemo(() => buildEvidenceIndex(records), [records]);

  const filteredIndex = evidenceIndex.filter((item) => {
    const matchesSearch =
      item.documentName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.hashValue.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.latestRecord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedItem =
    filteredIndex.find((item) => item.hashValue === selectedHash) ??
    filteredIndex[0] ??
    null;

  const draftCount = records.filter((record) => record.status === "draft").length;
  const confirmedCount = records.filter((record) => record.status === "confirmed").length;

  return (
    <section className="page vault-page">
      <div className="vault-header">
        <p className="vault-eyebrow">Evidence Repository</p>
        <h2>Evidence Vault</h2>
        <p>
          Organize cryptographic evidence records by unique document fingerprint.
          Documents are not stored here.
        </p>
      </div>

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
        <input
          type="search"
          placeholder="Search by filename or hash..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as VaultStatusFilter)
          }
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="signed">Signed</option>
          <option value="submitted">Submitted</option>
          <option value="confirmed">Confirmed</option>
          <option value="failed">Failed</option>
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
        <div className="evidence-workspace">
          <aside className="evidence-index">
            <h3>Unique Document Fingerprints</h3>

            {filteredIndex.map((item) => (
              <button
                className={
                  selectedItem?.hashValue === item.hashValue
                    ? "evidence-index-item active"
                    : "evidence-index-item"
                }
                key={item.hashValue}
                type="button"
                onClick={() => setSelectedHash(item.hashValue)}
              >
                <strong>{item.documentName}</strong>
                <span>{item.latestRecord.status}</span>
                <span>{item.records.length} records</span>
                <code>{shorten(item.hashValue)}</code>
              </button>
            ))}
          </aside>

          <main className="evidence-workspace-detail">
            {selectedItem && (
              <>
                <div className="evidence-workspace-summary">
                  <p className="vault-index-label">Selected Unique Document Fingerprint</p>
                  <h3>{selectedItem.documentName}</h3>
                  <p>Evidence records for this fingerprint: {selectedItem.records.length}</p>
                  <code>{selectedItem.hashValue}</code>
                </div>

                <EvidenceDetailsPanel
                  record={selectedItem.latestRecord}
                  onClose={() => setSelectedHash("")}
                />

                <div className="evidence-history">
                  <h3>Evidence History</h3>

                  {selectedItem.records.map((record) => (
                    <div className="evidence-history-item" key={record.id}>
                      <strong>{record.status}</strong>
                      <span>{new Date(record.createdAt).toLocaleString()}</span>
                      <code>{shorten(record.id)}</code>
                    </div>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </section>
  );
}

export default VaultPage;
