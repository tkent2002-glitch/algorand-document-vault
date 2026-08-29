import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

import Header from "./components/Header/Header";
import Navigation from "./components/Navigation/Navigation";
import DashboardPage from "./pages/DashboardPage/DashboardPage";

import "./App.css";

type Page = "dashboard" | "notarize" | "verify" | "vault" | "wallet";

const NotarizePage = lazy(
  () => import("./pages/NotarizePage/NotarizePage")
);
const VerifyPage = lazy(
  () => import("./pages/VerifyPage/VerifyPage")
);
const VaultPage = lazy(
  () => import("./pages/VaultPage/VaultPage")
);
const WalletPage = lazy(
  () => import("./pages/WalletPage/WalletPage")
);

function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [notarizationComplete, setNotarizationComplete] =
    useState(false);
  const [notarizeSessionKey, setNotarizeSessionKey] =
    useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const initialRender = useRef(true);
  const preventScrollOnNextFocus = useRef(false);

  function handleNavigate(
    page: Page,
    options?: { preventScroll?: boolean }
  ) {
    if (
      page === "notarize" &&
      activePage === "notarize" &&
      notarizationComplete
    ) {
      setNotarizeSessionKey((currentKey) => currentKey + 1);
      setNotarizationComplete(false);
    }

    preventScrollOnNextFocus.current =
      options?.preventScroll ?? false;
    setActivePage(page);
  }

  useEffect(() => {
    const pageNames: Record<Page, string> = {
      dashboard: "Dashboard",
      notarize: "Notarize",
      verify: "Verify",
      vault: "Evidence Vault",
      wallet: "Wallet",
    };

    document.title = `${pageNames[activePage]} | Algorand Document Vault`;

    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    mainRef.current?.focus({
      preventScroll: preventScrollOnNextFocus.current,
    });
    preventScrollOnNextFocus.current = false;
  }, [activePage]);

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <aside className="app-sidebar">
        <Header />
        <Navigation
          activePage={activePage}
          onNavigate={handleNavigate}
        />

        <div className="app-sidebar-boundary" aria-label="Workspace boundaries">
          <div>
            <span className="app-status-dot" aria-hidden="true" />
            <span>Algorand TestNet</span>
          </div>
          <p>Evidence metadata stays on this device.</p>
        </div>
      </aside>

      <div className="app-workspace">
        <div className="app-topbar" aria-label="Workspace status">
          <span>Public alpha workspace</span>
          <div>
            <span className="app-topbar-pill">TestNet only</span>
            <span className="app-topbar-pill">Documents stay local</span>
          </div>
        </div>

        <main
          className="app-main"
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
        >
          <Suspense fallback={<p role="status">Loading page...</p>}>
            {activePage === "dashboard" && (
              <DashboardPage onNavigate={handleNavigate} />
            )}
            {activePage === "notarize" && (
              <NotarizePage
                key={notarizeSessionKey}
                onCompletionChange={setNotarizationComplete}
              />
            )}
            {activePage === "verify" && <VerifyPage />}
            {activePage === "vault" && <VaultPage />}
            {activePage === "wallet" && <WalletPage />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;
