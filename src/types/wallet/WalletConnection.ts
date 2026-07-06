export type WalletConnectionStatus =
    | "disconnected"
    | "connecting"
    | "connected"
    | "error";

export type WalletConnection = {
    status: WalletConnectionStatus;
    address?: string;
};
