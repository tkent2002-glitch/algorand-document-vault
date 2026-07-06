import "./DashboardPage.css";

type DashboardPageProps = {
  onNavigate: (page: "dashboard" | "notarize" | "verify" | "vault" | "wallet") => void;
};

function DashboardPage({ onNavigate }: DashboardPageProps) {
  return (
    <section className="page dashboard-page">
      <div className="hero-panel">
        <p className="eyebrow">Algorand Document Vault</p>
        <h2>Cryptographic document integrity, anchored on Algorand.</h2>
        <p>
          Create a SHA-256 fingerprint, prepare a privacy-preserving proof payload,
          connect Pera Wallet, and preserve a local evidence record.
        </p>

        <div className="hero-actions">
          <button onClick={() => onNavigate("notarize")}>Start Notarization</button>
          <button onClick={() => onNavigate("verify")}>Verify Document</button>
        </div>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <strong>Proof, not document storage</strong>
          <p>Documents stay with the holder. Only hash-based proof is prepared for Algorand.</p>
        </div>

        <div className="feature-card">
          <strong>Evidence Vault</strong>
          <p>Track local evidence records without storing sensitive document contents.</p>
        </div>

        <div className="feature-card">
          <strong>Verification ready</strong>
          <p>Re-hash a document later and compare it against saved evidence records.</p>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
