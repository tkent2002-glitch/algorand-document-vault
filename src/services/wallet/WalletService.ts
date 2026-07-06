import type { WalletConnection } from "../../types/wallet";

export class WalletService {

    static getConnection(): WalletConnection {

        return {
            status: "disconnected"
        };
    }
}
