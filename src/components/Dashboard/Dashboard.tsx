import "./Dashboard.css";

type Page = "dashboard" | "notarize" | "verify" | "vault" | "wallet";

type DashboardProps = {
  onNavigate: (page: Page) => void;
};

const dashboardItems: {
  icon: string;
  title: string;
  description: string;
  page: Page;
}[] = [
  {
    icon: "📄",
    title: "Notarize Document",
    description: "Create a SHA-256 fingerprint and notarize it on Algorand.",
    page: "notarize",
  },
  {
    icon: "✅",
    title: "Verify Document",
    description: "Check whether a document still matches its blockchain proof.",
    page: "verify",
  },
  {
    icon: "🗂",
    title: "Document Vault",
    description: "View saved notarization records and transaction details.",
    page: "vault",
  },
  {
    icon: "👛",
    title: "Wallet Status",
    description: "Connect Pera Wallet and view your current wallet state.",
    page: "wallet",
  },
];

function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <section className="dashboard">
      <h2>Dashboard</h2>
      <p className="dashboard-intro">
        Start here to notarize, verify, and manage your document proofs.
      </p>

      <div className="dashboard-grid">
        {dashboardItems.map((item) => (
          <button
            className="dashboard-card"
            key={item.title}
            type="button"
            onClick={() => onNavigate(item.page)}
          >
            <span className="dashboard-card-icon">{item.icon}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default Dashboard;