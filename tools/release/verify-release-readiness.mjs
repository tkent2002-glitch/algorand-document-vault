import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const approvedVersion = "0.1.0-alpha";
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(path)));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }

  return files;
}

export function validateReleaseReadiness(input) {
  const errors = [];
  const packageJson = JSON.parse(input.packageJson);
  const packageLock = JSON.parse(input.packageLock);

  if (packageJson.version !== approvedVersion) {
    errors.push(
      `package.json version must be ${approvedVersion}; found ${packageJson.version}.`
    );
  }

  if (
    packageLock.version !== approvedVersion ||
    packageLock.packages?.[""]?.version !== approvedVersion
  ) {
    errors.push("package-lock.json release identity does not match package.json.");
  }

  if (!input.versionSource.includes(`APP_VERSION = "${approvedVersion}"`)) {
    errors.push("Application runtime version does not match the approved alpha version.");
  }

  if (!input.versionSource.includes('APP_STAGE = "Public Alpha Candidate"')) {
    errors.push("Application stage must identify this build as a public alpha candidate.");
  }

  if (!input.networkSource.includes('network: "testnet"')) {
    errors.push("The default Algorand network must remain TestNet.");
  }

  if (!input.networkSource.includes("https://testnet-api.algonode.cloud")) {
    errors.push("The default Algorand endpoint must remain the approved TestNet endpoint.");
  }

  if (!input.policySource.includes('ALGORAND_TESTNET_GENESIS_ID = "testnet-v1.0"')) {
    errors.push("The transaction policy must continue to require the TestNet genesis.");
  }

  for (const source of input.productionSources) {
    if (/https:\/\/[^\s"']*mainnet[^\s"']*/i.test(source.contents)) {
      errors.push(`Production source contains a MainNet endpoint: ${source.path}.`);
    }
  }

  if (!input.changelog.includes(`[${approvedVersion}] - Planned`)) {
    errors.push("CHANGELOG.md does not contain the planned alpha release heading.");
  }

  return errors;
}

export async function verifyReleaseReadiness(root = projectRoot) {
  const sourceRoot = join(root, "src");
  const sourceFiles = await listSourceFiles(sourceRoot);
  const productionSources = await Promise.all(
    sourceFiles.map(async (path) => ({
      path: relative(root, path).replaceAll("\\", "/"),
      contents: await readFile(path, "utf8"),
    }))
  );

  const errors = validateReleaseReadiness({
    packageJson: await readFile(join(root, "package.json"), "utf8"),
    packageLock: await readFile(join(root, "package-lock.json"), "utf8"),
    versionSource: await readFile(join(root, "src/core/Version.ts"), "utf8"),
    networkSource: await readFile(
      join(root, "src/types/algorand/AlgorandNetworkConfig.ts"),
      "utf8"
    ),
    policySource: await readFile(
      join(root, "src/services/algorand/AlgorandTransactionPolicyService.ts"),
      "utf8"
    ),
    changelog: await readFile(join(root, "CHANGELOG.md"), "utf8"),
    productionSources,
  });

  if (errors.length > 0) {
    throw new Error(`Release readiness verification failed:\n- ${errors.join("\n- ")}`);
  }

  return { approvedVersion, sourceFileCount: productionSources.length };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";

if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = await verifyReleaseReadiness();
  console.info(
    `Release candidate ${result.approvedVersion} passed identity and TestNet boundary checks across ${result.sourceFileCount} production source files.`
  );
}
