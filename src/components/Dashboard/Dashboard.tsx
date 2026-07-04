import "./Dashboard.css";

function Dashboard() {
  return (
    <section className="dashboard">
      <h2>Dashboard</h2>
      <p className="dashboard-intro">
        Start here to notarize, verify, and manage your document proofs.
      </p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>📄 Notarize Document</h3>
          <p>Create a SHA-256 fingerprint and notarize it on Algorand.</p>
        </div>

        <div className="dashboard-card">
          <h3>✅ Verify Document</h3>
          <p>Check whether a document still matches its blockchain proof.</p>
        </div>

        <div className="dashboard-card">
          <h3>🗂 Document Vault</h3>
          <p>View saved notarization records and transaction details.</p>
        </div>

        <div className="dashboard-card">
          <h3>👛 Wallet Status</h3>
          <p>Connect Pera Wallet and view your current wallet state.</p>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;