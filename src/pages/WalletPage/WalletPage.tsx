import { useEffect, useState } from "react";
import { WalletService } from "../../services";
import type { WalletConnection } from "../../types/wallet";
import "./WalletPage.css";

function WalletPage() {
  const [connection, setConnection] = useState<WalletConnection>({
    status: "disconnected",
  });

  const [message, setMessage] = useState<string>("Wallet not connected.");

  useEffect(() => {
    WalletService.reconnect().then((result) => {
      setConnection(result);
      setMessage(
        result.status === "connected"
          ? "Existing Pera Wallet session restored."
          : "Wallet not connected."
      );
    });
  }, []);

  async function handleConnect() {
    setConnection({ status: "connecting" });
    setMessage("Opening Pera Wallet connection...");

    const result = await WalletService.connect();

    setConnection(result);
    setMessage(
      result.status === "connected"
        ? "Pera Wallet connected successfully."
        : "Pera Wallet connection was not completed."
    );
  }

  async function handleDisconnect() {
    const result = await WalletService.disconnect();

    setConnection(result);
    setMessage("Pera Wallet disconnected.");
  }

  const isConnected = connection.status === "connected";

  return (
    <section className="page">
      <h2>Wallet Status</h2>
      <p>Connect your Pera Wallet to prepare for Algorand notarization.</p>

      <div className="wallet-panel">
        <p>
          <strong>Status:</strong> {connection.status}
        </p>

        <p>
          <strong>Message:</strong> {message}
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
