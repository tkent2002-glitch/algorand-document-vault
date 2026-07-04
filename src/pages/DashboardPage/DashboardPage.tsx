import Dashboard from "../../components/Dashboard/Dashboard";
import "./DashboardPage.css";

type Page = "dashboard" | "notarize" | "verify" | "vault" | "wallet";

type DashboardPageProps = {
  onNavigate: (page: Page) => void;
};

function DashboardPage({ onNavigate }: DashboardPageProps) {
  return <Dashboard onNavigate={onNavigate} />;
}

export default DashboardPage;