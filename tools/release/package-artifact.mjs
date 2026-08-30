import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const distRoot = join(projectRoot, "dist");
const releaseRoot = join(projectRoot, "release");
const artifactRoot = join(releaseRoot, "algorand-document-vault-public-alpha");
const requiredFiles = ["index.html", "_headers", "_redirects"];
const forbiddenFilePatterns = [
  /(^|\/)\.env(?:\.|$)/i,
  /\.(?:db|key|p12|pem|pfx|sqlite)$/i,
  /\.map$/i,
  /algorand-document-vault-(?:encrypted-)?backup-.*\.json$/i,
];

async function listFiles(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(root, path)));
    } else if (entry.isFile()) {
      files.push(relative(root, path).replaceAll("\\", "/"));
    }
  }

  return files.sort();
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

await stat(join(distRoot, "index.html"));
await rm(releaseRoot, { force: true, recursive: true });
await mkdir(artifactRoot, { recursive: true });
await cp(distRoot, artifactRoot, { recursive: true });

const files = await listFiles(artifactRoot);

for (const requiredFile of requiredFiles) {
  if (!files.includes(requiredFile)) {
    throw new Error(`Release artifact is missing ${requiredFile}.`);
  }
}

for (const file of files) {
  if (forbiddenFilePatterns.some((pattern) => pattern.test(file))) {
    throw new Error(`Release artifact contains forbidden file: ${file}`);
  }
}

const indexHtml = await readFile(join(artifactRoot, "index.html"), "utf8");

if (indexHtml.includes("/src/") || indexHtml.includes("src/main.tsx")) {
  throw new Error("Release index still references development source files.");
}

const localReferences = Array.from(
  indexHtml.matchAll(/(?:href|src)="(\/(?!\/)[^"]+)"/g),
  (match) => match[1].split(/[?#]/, 1)[0].replace(/^\//, "")
);

for (const referencedFile of localReferences) {
  if (!files.includes(referencedFile)) {
    throw new Error(`Release index references missing file: ${referencedFile}`);
  }
}

const headers = await readFile(join(artifactRoot, "_headers"), "utf8");
const requiredHeaders = [
  "Content-Security-Policy:",
  "wss://*.perawallet.app",
  "wss://*.bridge.walletconnect.org",
  "Permissions-Policy:",
  "Referrer-Policy:",
  "X-Content-Type-Options: nosniff",
  "X-Frame-Options: DENY",
];

for (const requiredHeader of requiredHeaders) {
  if (!headers.includes(requiredHeader)) {
    throw new Error(`Release header policy is missing: ${requiredHeader}`);
  }
}

const manifestLines = [];

for (const file of files) {
  const contents = await readFile(join(artifactRoot, file));
  manifestLines.push(`${sha256(contents)}  ${file}`);
}

await writeFile(
  join(artifactRoot, "SHA256SUMS"),
  `${manifestLines.join("\n")}\n`,
  "utf8"
);

console.info(
  `Packaged ${files.length} files in ${relative(projectRoot, artifactRoot)} with SHA-256 manifest.`
);
