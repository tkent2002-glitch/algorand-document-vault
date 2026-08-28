import "./Navigation.css";

type Page = "dashboard" | "notarize" | "verify" | "vault" | "wallet";

type NavigationProps = {
  activePage: Page;
  onNavigate: (page: Page) => void;
};

const navigationItems: { label: string; page: Page }[] = [
  { label: "Dashboard", page: "dashboard" },
  { label: "Notarize", page: "notarize" },
  { label: "Verify", page: "verify" },
  { label: "Vault", page: "vault" },
  { label: "Wallet", page: "wallet" },
];

function NavigationIcon({ page }: { page: Page }) {
  const paths: Record<Page, React.ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    notarize: (
      <>
        <path d="M6 2.8h8l4 4V21H6z" />
        <path d="M14 3v5h5M9 12h6M9 16h4" />
      </>
    ),
    verify: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.4 15.4 5.1 5.1M7.8 10.6l1.8 1.8 3.8-4" />
      </>
    ),
    vault: (
      <>
        <path d="M4 7h16v13H4zM7 3h10l2 4H5z" />
        <path d="M9 11h6M10 15h4" />
      </>
    ),
    wallet: (
      <>
        <path d="M3 6.5h15.5A2.5 2.5 0 0 1 21 9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M3.5 7 16 3v3.5M16 11h5v5h-5a2.5 2.5 0 0 1 0-5z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="navigation-icon"
      viewBox="0 0 24 24"
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

function Navigation({ activePage, onNavigate }: NavigationProps) {
  return (
    <nav className="app-navigation" aria-label="Primary navigation">
      <span className="navigation-label">Workspace</span>
      {navigationItems.map((item) => (
        <button
          className={activePage === item.page ? "active" : ""}
          aria-current={activePage === item.page ? "page" : undefined}
          key={item.page}
          onClick={() => onNavigate(item.page)}
          type="button"
        >
          <NavigationIcon page={item.page} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default Navigation;
