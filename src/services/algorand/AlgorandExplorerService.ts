import { DEFAULT_ALGORAND_NETWORK_CONFIG } from "../../types";

export class AlgorandExplorerService {
  static getTransactionUrl(transactionId: string): string {
    const network = DEFAULT_ALGORAND_NETWORK_CONFIG.network;

    if (network === "testnet") {
      return `https://testnet.explorer.perawallet.app/tx/${transactionId}`;
    }

    return `https://explorer.perawallet.app/tx/${transactionId}`;
  }
}
