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
  const mainRef = useRef<HTMLElement>(null);
  const initialRender = useRef(true);

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

    mainRef.current?.focus();
  }, [activePage]);

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Header />
      <Navigation activePage={activePage} onNavigate={setActivePage} />

      <main
        className="app-main"
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
      >
        <Suspense fallback={<p role="status">Loading page...</p>}>
          {activePage === "dashboard" && (
            <DashboardPage onNavigate={setActivePage} />
          )}
          {activePage === "notarize" && <NotarizePage />}
          {activePage === "verify" && <VerifyPage />}
          {activePage === "vault" && <VaultPage />}
          {activePage === "wallet" && <WalletPage />}
        </Suspense>
      </main>
    </div>
  );
}

export default App;
