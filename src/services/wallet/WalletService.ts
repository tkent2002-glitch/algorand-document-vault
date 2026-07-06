import { PeraWalletConnect } from "@perawallet/connect";

export class WalletService {

    private static readonly pera =
        new PeraWalletConnect();

    static sdkLoaded(): boolean {

        return WalletService.pera instanceof PeraWalletConnect;
    }
}
