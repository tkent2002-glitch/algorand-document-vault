import { resolve } from "node:path";
import { startStaticArtifactServer } from "../../tools/release/static-artifact-server.mjs";

export default async function artifactGlobalSetup() {
  const server = await startStaticArtifactServer({
    root: resolve(
      "release",
      "algorand-document-vault-public-alpha"
    ),
    port: 4190,
  });

  return async () => {
    await new Promise<void>((resolveClose, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolveClose();
      });
    });
  };
}
