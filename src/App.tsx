import Header from "./components/Header/Header";
import Navigation from "./components/Navigation/Navigation";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
      }}
    >
      <Header />
      <Navigation />

      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;