import Header from "./components/Header";
import Navigation from "./components/Navigation/Navigation";

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

      <main
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h2>Welcome</h2>

        <p>Welcome to Algorand Document Vault.</p>

        <p>
          This application will allow you to securely notarize documents on the
          Algorand blockchain while keeping your files private.
        </p>

        <hr />

        <h3>Coming Soon</h3>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            fontSize: "1.2rem",
            lineHeight: "2",
          }}
        >
          <li>📄 Notarize Document</li>
          <li>✅ Verify Document</li>
          <li>🗂 Document Vault</li>
          <li>👛 Wallet Connection</li>
        </ul>
      </main>
    </div>
  );
}

export default App;