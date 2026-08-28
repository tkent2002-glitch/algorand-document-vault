import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
  },
  resolve: {
    alias: {
      buffer: "buffer/",
    },
  },
  define: {
    global: "globalThis",
  },
  build: {
    rolldownOptions: {
      output: {
        strictExecutionOrder: true,
        codeSplitting: {
          groups: [
            {
              name: "algorand",
              test: /node_modules[\\/]algosdk[\\/]/,
              includeDependenciesRecursively: true,
              priority: 20,
            },
            {
              name: "pera-wallet",
              test:
                /node_modules[\\/](@perawallet|@walletconnect|@evanhahn|qr-code-styling)[\\/]/,
              includeDependenciesRecursively: false,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
