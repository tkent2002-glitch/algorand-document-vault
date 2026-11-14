import { AlgorandService } from "./AlgorandService";
import { WalletService } from "../wallet/WalletService";

export type AlgorandTestNetPreflightResult = {
  ready: boolean;
  network: string;
  nodeConnected: boolean;
  walletConnected: boolean;
  walletAddress: string | null;
  checks: {
    networkConfiguredForTestNet: boolean;
    algodReachable: boolean;
    walletSessionAvailable: boolean;
  };
  errors: string[];
};

export class AlgorandTestNetPreflightService {
  static async evaluate(): Promise<AlgorandTestNetPreflightResult> {
    const errors: string[] = [];
    const networkConfig = AlgorandService.getNetworkConfig();

    const networkConfiguredForTestNet =
      networkConfig.network === "testnet";

    if (!networkConfiguredForTestNet) {
      errors.push(
        "The application is not configured for Algorand TestNet."
      );
    }

    const nodeStatus = await AlgorandService.checkNodeStatus();

    if (!nodeStatus.connected) {
      errors.push(
        "The configured Algorand node could not be reached."
      );
    }

    const wallet = await WalletService.reconnect();

    const walletConnected =
      wallet.status === "connected" &&
      Boolean(wallet.address);

    if (!walletConnected) {
      errors.push(
        "A connected Pera Wallet TestNet account is required."
      );
    }

    return {
      ready:
        networkConfiguredForTestNet &&
        nodeStatus.connected &&
        walletConnected,
      network: networkConfig.network,
      nodeConnected: nodeStatus.connected,
      walletConnected,
      walletAddress: wallet.address ?? null,
      checks: {
        networkConfiguredForTestNet,
        algodReachable: nodeStatus.connected,
        walletSessionAvailable: walletConnected,
      },
      errors,
    };
  }
}
