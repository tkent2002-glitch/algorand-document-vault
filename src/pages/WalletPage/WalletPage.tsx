import { useEffect, useState } from "react";
import { WalletService } from "../../services";
import type { WalletConnection } from "../../types/wallet";
import "./WalletPage.css";

function shortenAddress(address: string): string {
  if (address.length <= 20) {
    return address;
  }

  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

function WalletPage() {
  const [connection, setConnection] = useState<WalletConnection>({
    status: "disconnected",
  });

  const [message, setMessage] = useState<string>(
    "Wallet not connected."
  );

  useEffect(() => {
    WalletService.reconnect().then((result) => {
      setConnection(result);

      setMessage(
        result.status === "connected"
          ? "Existing Pera Wallet session restored."
          : result.status === "error"
            ? "Pera Wallet session could not be restored."
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
        : result.status === "error"
          ? "Pera Wallet connection failed."
          : "Pera Wallet connection was not completed."
    );
  }

  async function handleDisconnect() {
    const result = await WalletService.disconnect();

    setConnection(result);
    setMessage(
      result.status === "disconnected"
        ? "Pera Wallet disconnected."
        : "Pera Wallet could not be disconnected cleanly."
    );
  }

  const isConnected =
    connection.status === "connected";

  const isConnecting =
    connection.status === "connecting";

  return (
    <section className="page wallet-page">
      <div className="wallet-header">
        <p className="wallet-eyebrow">Wallet Connection</p>

        <h2>Pera Wallet</h2>

        <p>
          Connect a Pera Wallet account to review and sign Algorand
          TestNet notarization transactions.
        </p>
      </div>

      <div className="wallet-readiness-summary">
        <div>
          <span>Network</span>
          <strong>Algorand TestNet</strong>
        </div>

        <div>
          <span>Wallet</span>
          <strong>
            {isConnected ? "Connected" : "Not Connected"}
          </strong>
        </div>

        <div>
          <span>Signing</span>
          <strong>
            {isConnected ? "Available" : "Unavailable"}
          </strong>
        </div>
      </div>

      <div className="wallet-panel">
        <div className="wallet-panel-header">
          <div>
            <strong>Connection Status</strong>
            <p role="status" aria-live="polite">
              {message}
            </p>
          </div>

          <span
            className={
              isConnected
                ? "wallet-status connected"
                : "wallet-status disconnected"
            }
          >
            {connection.status}
          </span>
        </div>

        {connection.address ? (
          <div className="wallet-address-panel">
            <span>Connected Address</span>

            <code title={connection.address}>
              {shortenAddress(connection.address)}
            </code>
          </div>
        ) : (
          <div className="wallet-address-panel">
            <span>Connected Address</span>
            <strong>None</strong>
          </div>
        )}

        <div className="wallet-purpose">
          <strong>What the Wallet Is Used For</strong>

          <p>
            Pera Wallet is used to approve and sign Algorand
            transactions created by the application.
          </p>

          <p>
            Your private keys remain inside the wallet. This
            application does not receive, store, or manage them.
          </p>
        </div>

        <button
          type="button"
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={isConnecting}
        >
          {isConnecting
            ? "Connecting..."
            : isConnected
              ? "Disconnect Pera Wallet"
              : "Connect Pera Wallet"}
        </button>
      </div>

      <div className="wallet-security-boundary">
        <strong>Security Boundary</strong>

        <p>
          Connecting a wallet does not submit a transaction.
          Blockchain submission only occurs after a transaction is
          prepared, explicitly signed, and explicitly submitted.
        </p>
      </div>
    </section>
  );
}

export default WalletPage;
