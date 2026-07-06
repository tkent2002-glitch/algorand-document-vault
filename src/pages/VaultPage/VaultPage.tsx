import { useEffect, useMemo, useState } from "react";
import EvidenceCard from "../../components/cards/EvidenceCard";
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
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      hashValue,
      documentName: sorted[0].documentName,
      latestRecord: sorted[0],
      records: sorted,
    };
  });
}

function VaultPage() {
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<VaultStatusFilter>("all");
  const [selectedRecord, setSelectedRecord] = useState<EvidenceRecord | null>(null);

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

  const draftCount = records.filter((record) => record.status === "draft").length;
  const confirmedCount = records.filter(
    (record) => record.status === "confirmed"
  ).length;

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

      {selectedRecord && (
        <EvidenceDetailsPanel
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

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
        <div className="vault-list">
          {filteredIndex.map((item) => (
            <div className="vault-index-card" key={item.hashValue}>
              <div className="vault-index-meta">
                <p className="vault-index-label">Unique Document Fingerprint</p>
                <h3>{item.documentName}</h3>
                <p>Evidence records for this fingerprint: {item.records.length}</p>
              </div>

              <EvidenceCard
                record={item.latestRecord}
                onViewDetails={setSelectedRecord}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default VaultPage;
