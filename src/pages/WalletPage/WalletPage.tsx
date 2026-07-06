import { useEffect, useState } from "react";
import { WalletService } from "../../services";
import type { WalletConnection } from "../../types/wallet";
import "./WalletPage.css";

function WalletPage() {
  const [connection, setConnection] = useState<WalletConnection>({
    status: "disconnected",
  });

  useEffect(() => {
    WalletService.reconnect().then(setConnection);
  }, []);

  async function handleConnect() {
    setConnection({ status: "connecting" });
    const result = await WalletService.connect();
    setConnection(result);
  }

  async function handleDisconnect() {
    const result = await WalletService.disconnect();
    setConnection(result);
  }

  const isConnected = connection.status === "connected";

  return (
    <section className="page">
      <h2>Wallet Status</h2>
      <p>Connect your Pera Wallet to begin notarizing documents.</p>

      <div className="wallet-panel">
        <p>
          <strong>Status:</strong> {connection.status}
        </p>

        {connection.address && (
          <p>
            <strong>Address:</strong> {connection.address}
          </p>
        )}

        <button onClick={isConnected ? handleDisconnect : handleConnect}>
          {isConnected ? "Disconnect Pera Wallet" : "Connect Pera Wallet"}
        </button>
      </div>
    </section>
  );
}

export default WalletPage;
