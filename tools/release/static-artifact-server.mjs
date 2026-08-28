import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, isAbsolute, join, normalize, relative, resolve } from "node:path";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function parseHeaderRules(source) {
  const rules = [];
  let currentRule = null;

  for (const rawLine of source.split(/\r?\n/)) {
    if (!rawLine.trim()) {
      continue;
    }

    if (!/^\s/.test(rawLine)) {
      currentRule = { pattern: rawLine.trim(), headers: {} };
      rules.push(currentRule);
      continue;
    }

    const separator = rawLine.indexOf(":");

    if (currentRule && separator > 0) {
      currentRule.headers[rawLine.slice(0, separator).trim()] = rawLine
        .slice(separator + 1)
        .trim();
    }
  }

  return rules;
}

function matches(pattern, pathname) {
  if (pattern.endsWith("*")) {
    return pathname.startsWith(pattern.slice(0, -1));
  }

  return pathname === pattern;
}

export async function startStaticArtifactServer({ root, port = 4190 }) {
  const resolvedRoot = resolve(root);
  const headerRules = parseHeaderRules(
    await readFile(join(resolvedRoot, "_headers"), "utf8")
  );

  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
      const pathname = decodeURIComponent(requestUrl.pathname);
      const requestedPath = normalize(pathname).replace(/^[/\\]+/, "");
      let filePath = resolve(resolvedRoot, requestedPath || "index.html");

      const relativePath = relative(resolvedRoot, filePath);

      if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
        response.writeHead(400).end("Invalid path.");
        return;
      }

      try {
        const fileStatus = await stat(filePath);

        if (!fileStatus.isFile()) {
          filePath = join(resolvedRoot, "index.html");
        }
      } catch {
        filePath = join(resolvedRoot, "index.html");
      }

      const responseHeaders = {
        "Content-Type":
          contentTypes[extname(filePath)] ?? "application/octet-stream",
      };

      for (const rule of headerRules) {
        if (matches(rule.pattern, pathname)) {
          Object.assign(responseHeaders, rule.headers);
        }
      }

      response.writeHead(200, responseHeaders);
      response.end(await readFile(filePath));
    } catch (error) {
      response.writeHead(500).end(
        error instanceof Error ? error.message : "Artifact server failed."
      );
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });

  return server;
}
