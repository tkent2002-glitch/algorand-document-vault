import { useEffect, useState } from "react";
import EvidenceCard from "../../components/cards/EvidenceCard";
import { EvidenceRecordStoreService } from "../../services";
import type { EvidenceRecord } from "../../services";
import "./VaultPage.css";

function VaultPage() {
  const [records, setRecords] = useState<EvidenceRecord[]>([]);

  useEffect(() => {
    setRecords(EvidenceRecordStoreService.list());
  }, []);

  return (
    <section className="page">
      <h2>Evidence Vault</h2>
      <p>Local notarization records. Documents are not stored here.</p>

      {records.length === 0 ? (
        <div className="vault-empty">
          <strong>No evidence records yet.</strong>
          <p>Create a proof on the Notarize page to add a local evidence record.</p>
        </div>
      ) : (
        <div className="vault-list">
          {records.map((record) => (
            <EvidenceCard record={record} key={record.id} />
          ))}
        </div>
      )}
    </section>
  );
}

export default VaultPage;
