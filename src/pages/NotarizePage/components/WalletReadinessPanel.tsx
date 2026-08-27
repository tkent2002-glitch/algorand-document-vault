import type { WalletConnection } from "../../../types/wallet";

type WalletReadinessPanelProps = {
  wallet: WalletConnection;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
};

function WalletReadinessPanel({
  wallet,
  connecting,
  onConnect,
  onDisconnect,
}: WalletReadinessPanelProps) {
  const connected = wallet.status === "connected";
  const hasError = wallet.status === "error";

  return (
    <div className="notarize-result wallet-readiness-panel">
      <div className="wallet-readiness-header">
        <strong>Wallet Readiness</strong>

        <span>
          {connected ? "Connected" : "Not Connected"}
        </span>
      </div>

      {connected ? (
        <>
          <p>
            Pera Wallet is connected and available for transaction
            signing.
          </p>

          {wallet.address && (
            <p>
              <strong>Address:</strong>{" "}
              <code>{wallet.address}</code>
            </p>
          )}

          <button
            type="button"
            onClick={onDisconnect}
            disabled={connecting}
          >
            Disconnect Wallet
          </button>
        </>
      ) : (
        <>
          <p>
            {hasError
              ? "Pera Wallet could not complete the previous wallet operation."
              : "Connect Pera Wallet before approving an Algorand notarization transaction."}
          </p>

          <p>
            {hasError
              ? "No signing or submission action will proceed until a valid wallet connection is established."
              : "Selecting a document does not upload or submit anything to the blockchain."}
          </p>

          <button
            type="button"
            onClick={onConnect}
            disabled={connecting}
          >
            {connecting
              ? "Connecting..."
              : hasError
                ? "Retry Pera Wallet Connection"
                : "Connect Pera Wallet"}
          </button>
        </>
      )}
    </div>
  );
}

export default WalletReadinessPanel;

