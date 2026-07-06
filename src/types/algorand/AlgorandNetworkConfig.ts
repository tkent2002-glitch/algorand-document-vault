export type AlgorandNetwork = "testnet" | "mainnet";

export type AlgorandNetworkConfig = {
  network: AlgorandNetwork;
  algodServer: string;
  algodPort: string;
  algodToken: string;
};

export const DEFAULT_ALGORAND_NETWORK_CONFIG: AlgorandNetworkConfig = {
  network: "testnet",
  algodServer: "https://testnet-api.algonode.cloud",
  algodPort: "",
  algodToken: "",
};
