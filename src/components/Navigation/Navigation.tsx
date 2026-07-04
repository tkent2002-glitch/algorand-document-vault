import "./Navigation.css";

type Page = "dashboard" | "notarize" | "verify" | "vault" | "wallet";

type NavigationProps = {
  activePage: Page;
  onNavigate: (page: Page) => void;
};

function Navigation({ activePage, onNavigate }: NavigationProps) {
  return (
    <nav className="app-navigation">
      <button
        className={activePage === "dashboard" ? "active" : ""}
        onClick={() => onNavigate("dashboard")}
      >
        Dashboard
      </button>

      <button
        className={activePage === "notarize" ? "active" : ""}
        onClick={() => onNavigate("notarize")}
      >
        Notarize
      </button>

      <button
        className={activePage === "verify" ? "active" : ""}
        onClick={() => onNavigate("verify")}
      >
        Verify
      </button>

      <button
        className={activePage === "vault" ? "active" : ""}
        onClick={() => onNavigate("vault")}
      >
        Vault
      </button>

      <button
        className={activePage === "wallet" ? "active" : ""}
        onClick={() => onNavigate("wallet")}
      >
        Wallet
      </button>
    </nav>
  );
}

export default Navigation;