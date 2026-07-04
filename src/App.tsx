import { useState } from "react";

import Header from "./components/Header/Header";
import Navigation from "./components/Navigation/Navigation";
import Dashboard from "./components/Dashboard/Dashboard";

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
          <Dashboard onNavigate={setActivePage} />
        )}

        {activePage === "notarize" && <h2>Notarize Document</h2>}
        {activePage === "verify" && <h2>Verify Document</h2>}
        {activePage === "vault" && <h2>Document Vault</h2>}
        {activePage === "wallet" && <h2>Wallet Status</h2>}
      </main>
    </div>
  );
}

export default App;