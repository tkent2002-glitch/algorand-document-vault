import Header from "./components/Header/Header";
import Navigation from "./components/Navigation/Navigation";
import Dashboard from "./components/Dashboard/Dashboard";

import "./App.css";

function App() {
  return (
    <div className="app">
      <Header />
      <Navigation />

      <main className="app-main">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;