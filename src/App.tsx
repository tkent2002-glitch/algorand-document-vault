import { useState } from "react";

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

  return (
    <div className="app">
      <Header />
      <Navigation activePage={activePage} onNavigate={setActivePage} />

      <main className="app-main">
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