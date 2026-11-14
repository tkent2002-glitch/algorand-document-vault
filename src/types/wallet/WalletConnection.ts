export type WalletConnectionStatus =
    | "disconnected"
    | "connecting"
    | "connected"
    | "error";

export type WalletConnectionErrorReason =
    | "cancelled"
    | "network_mismatch"
    | "session_unavailable"
    | "unknown";

export type WalletConnection = {
    status: WalletConnectionStatus;
    address?: string;
    errorReason?: WalletConnectionErrorReason;
};
