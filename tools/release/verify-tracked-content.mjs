import { execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const trackedFiles = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  {
    cwd: projectRoot,
    encoding: "utf8",
  }
)
  .split("\0")
  .filter(Boolean);

const forbiddenFilePatterns = [
  /(^|\/)\.env(?:\.|$)/i,
  /\.(?:db|key|p12|pem|pfx|sqlite)$/i,
  /algorand-document-vault-(?:encrypted-)?backup-.*\.json$/i,
];
const allowedEnvironmentExamples = /^\.env(?:\..+)?\.example$/i;
const secretPatterns = [
  { label: "AWS access key", pattern: /AKIA[0-9A-Z]{16}/g },
  { label: "GitHub token", pattern: /gh[pousr]_[A-Za-z0-9]{36,}/g },
  { label: "OpenAI-style token", pattern: /sk-[A-Za-z0-9_-]{20,}/g },
  {
    label: "PEM private key",
    pattern: /-----BEGIN (?:EC |OPENSSH |RSA )?PRIVATE KEY-----/g,
  },
];
const findings = [];

for (const file of trackedFiles) {
  if (
    forbiddenFilePatterns.some((pattern) => pattern.test(file)) &&
    !allowedEnvironmentExamples.test(file)
  ) {
    findings.push(`Forbidden tracked filename: ${file}`);
  }

  const filePath = resolve(projectRoot, file);
  const fileStatus = await stat(filePath);

  if (fileStatus.size > 2 * 1024 * 1024) {
    continue;
  }

  const contents = await readFile(filePath, "utf8");

  if (contents.includes("\0")) {
    continue;
  }

  for (const { label, pattern } of secretPatterns) {
    pattern.lastIndex = 0;

    if (pattern.test(contents)) {
      findings.push(`${label} pattern found in ${file}`);
    }
  }
}

if (findings.length > 0) {
  throw new Error(findings.join("\n"));
}

console.info(
  `Verified ${trackedFiles.length} candidate files contain no blocked filenames or credential patterns.`
);
