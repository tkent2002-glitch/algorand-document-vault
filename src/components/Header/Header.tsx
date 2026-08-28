import "./Header.css";

function Header() {
  return (
    <header className="app-header">
      <span className="app-brand-mark" aria-hidden="true">
        A
      </span>
      <div>
        <h1>Algorand Document Vault</h1>
        <p>Document integrity workspace</p>
      </div>
    </header>
  );
}

export default Header;
