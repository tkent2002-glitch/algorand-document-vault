import { useEffect, useRef, useState } from "react";

import Header from "./components/Header/Header";
import Navigation from "./components/Navigation/Navigation";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import NotarizePage from "./pages/NotarizePage/NotarizePage";
import VerifyPage from "./pages/VerifyPage/VerifyPage";
import VaultPage from "./pages/VaultPage/VaultPage";
import WalletPage from "./pages/WalletPage/WalletPage";

import "./App.css";

type Page = "dashboard" | "notarize" | "verify" | "vault" | "wallet";

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
        {activePage === "dashboard" && (
          <DashboardPage onNavigate={setActivePage} />
        )}
        {activePage === "notarize" && <NotarizePage />}
        {activePage === "verify" && <VerifyPage />}
        {activePage === "vault" && <VaultPage />}
        {activePage === "wallet" && <WalletPage />}
      </main>
    </div>
  );
}

export default App;
