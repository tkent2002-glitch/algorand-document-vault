import { useEffect, useMemo, useState } from "react";
import { EvidenceRepository } from "../../repositories";
import type { EvidenceRecord } from "../../services";
import "./DashboardPage.css";

type DashboardPageProps = {
  onNavigate: (page: "dashboard" | "notarize" | "verify" | "vault" | "wallet") => void;
};

type DashboardDestination = Exclude<
  Parameters<DashboardPageProps["onNavigate"]>[0],
  "dashboard"
>;

const dashboardActions: {
  description: string;
  label: string;
  page: DashboardDestination;
  tone: string;
}[] = [
  {
    description: "Create a private SHA-256 proof and prepare a TestNet anchor.",
    label: "Start Notarization",
    page: "notarize",
    tone: "blue",
  },
  {
    description: "Compare a document with evidence already stored on this device.",
    label: "Verify Document",
    page: "verify",
    tone: "cyan",
  },
  {
    description: "Review local evidence, blockchain status, and backup controls.",
    label: "Open Evidence Vault",
    page: "vault",
    tone: "amber",
  },
  {
    description: "Connect Pera and manage TestNet transaction approvals.",
    label: "Manage Pera Wallet",
    page: "wallet",
    tone: "violet",
  },
];

function DashboardActionIcon({ page }: { page: DashboardDestination }) {
  const paths: Record<DashboardDestination, React.ReactNode> = {
    notarize: (
      <>
        <path d="M7 3h10l4 4v18H7z" />
        <path d="M17 3v6h6M11 14h6M11 19h4" />
        <circle cx="21" cy="22" r="4" />
      </>
    ),
    verify: (
      <>
        <path d="M13 19 9 23a5 5 0 0 1-7-7l5-5a5 5 0 0 1 7 0" />
        <path d="m19 13 4-4a5 5 0 0 0-7-7l-5 5a5 5 0 0 0 0 7" />
        <path d="m17 17 2 2 5-6" />
      </>
    ),
    vault: (
      <>
        <path d="M5 7h22v20H5zM9 3h14l3 4H6z" />
        <path d="M10 13h12M10 18h8M10 23h5" />
      </>
    ),
    wallet: (
      <>
        <path d="M4 8h21a3 3 0 0 1 3 3v14H7a3 3 0 0 1-3-3z" />
        <path d="M5 9 23 4v4M21 14h7v7h-7a3.5 3.5 0 0 1 0-7z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[page]}
    </svg>
  );
}

function recordTimestamp(record: EvidenceRecord): number {
  return new Date(
    record.confirmedAt ?? record.submittedAt ?? record.createdAt
  ).getTime();
}

function formatActivityTime(record: EvidenceRecord): string {
  const value = record.confirmedAt ?? record.submittedAt ?? record.createdAt;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [records, setRecords] = useState<EvidenceRecord[]>([]);

  useEffect(() => {
    let mounted = true;

    void EvidenceRepository.listAsync().then((repositoryRecords) => {
      if (mounted) {
        setRecords(repositoryRecords);
      }
    });

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

  const recentRecords = useMemo(
    () => [...records].sort((a, b) => recordTimestamp(b) - recordTimestamp(a)).slice(0, 4),
    [records]
  );

  const confirmedCount = records.filter(
    (record) => record.status === "confirmed"
  ).length;

  return (
    <section className="page dashboard-page">
      <div className="hero-panel">
        <p className="eyebrow">Integrity workspace</p>
        <h2>Cryptographic document integrity, anchored on Algorand.</h2>
        <p>
          Create privacy-preserving proof payloads, approve TestNet anchors in
          Pera Wallet, and preserve evidence locally.
        </p>

        <div className="dashboard-trust-row" aria-label="Workspace trust boundaries">
          <span>SHA-256 fingerprints</span>
          <span>Documents stay local</span>
          <span>Algorand TestNet</span>
        </div>
      </div>

      <div className="dashboard-action-grid">
        {dashboardActions.map((action) => (
          <button
            className={`dashboard-action-card ${action.tone}`}
            key={action.page}
            onClick={() => onNavigate(action.page)}
            type="button"
          >
            <span className="dashboard-action-icon">
              <DashboardActionIcon page={action.page} />
            </span>
            <strong>{action.label}</strong>
            <span>{action.description}</span>
            <span className="dashboard-action-link" aria-hidden="true">
              Open workflow <span>→</span>
            </span>
          </button>
        ))}
      </div>

      <section className="dashboard-activity" aria-labelledby="recent-activity-heading">
        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">Local evidence</p>
            <h3 id="recent-activity-heading">Recent activity</h3>
          </div>
          <div className="dashboard-summary" aria-label="Evidence summary">
            <span>{records.length} records</span>
            <span>{confirmedCount} confirmed</span>
          </div>
        </div>

        {recentRecords.length > 0 ? (
          <div className="dashboard-activity-list">
            {recentRecords.map((record) => (
              <article className="dashboard-activity-item" key={record.id}>
                <span className="activity-document-icon" aria-hidden="true" />
                <div>
                  <strong>{record.documentName}</strong>
                  <code>{record.hashValue.slice(0, 10)}...{record.hashValue.slice(-6)}</code>
                </div>
                <span className={`activity-status ${record.status}`}>
                  {record.status}
                </span>
                <time dateTime={record.confirmedAt ?? record.submittedAt ?? record.createdAt}>
                  {formatActivityTime(record)}
                </time>
              </article>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-activity">
            <strong>No evidence activity yet</strong>
            <p>Your local notarization records will appear here.</p>
          </div>
        )}

        <div className="dashboard-activity-footer">
          <button type="button" onClick={() => onNavigate("vault")}>View Evidence Vault</button>
        </div>
      </section>
    </section>
  );
}

export default DashboardPage;
