import "./Navigation.css";

type Page = "dashboard" | "notarize" | "verify" | "vault" | "wallet";

type NavigationProps = {
  activePage: Page;
  onNavigate: (page: Page) => void;
};

function Navigation({ activePage, onNavigate }: NavigationProps) {
  return (
    <nav className="app-navigation" aria-label="Primary navigation">
      <button
        className={activePage === "dashboard" ? "active" : ""}
        aria-current={activePage === "dashboard" ? "page" : undefined}
        onClick={() => onNavigate("dashboard")}
        type="button"
      >
        Dashboard
      </button>

      <button
        className={activePage === "notarize" ? "active" : ""}
        aria-current={activePage === "notarize" ? "page" : undefined}
        onClick={() => onNavigate("notarize")}
        type="button"
      >
        Notarize
      </button>

      <button
        className={activePage === "verify" ? "active" : ""}
        aria-current={activePage === "verify" ? "page" : undefined}
        onClick={() => onNavigate("verify")}
        type="button"
      >
        Verify
      </button>

      <button
        className={activePage === "vault" ? "active" : ""}
        aria-current={activePage === "vault" ? "page" : undefined}
        onClick={() => onNavigate("vault")}
        type="button"
      >
        Vault
      </button>

      <button
        className={activePage === "wallet" ? "active" : ""}
        aria-current={activePage === "wallet" ? "page" : undefined}
        onClick={() => onNavigate("wallet")}
        type="button"
      >
        Wallet
      </button>
    </nav>
  );
}

export default Navigation;
