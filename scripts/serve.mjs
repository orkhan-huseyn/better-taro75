// Preview the exported static site under the same base path GitHub Pages uses,
// so asset URLs (/better-taro75/...) resolve exactly like production.
//   npm run build && npm run serve  ->  http://localhost:3055/better-taro75/

import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const BASE_PATH = "/better-taro75";
const PORT = Number(process.env.PORT) || 3055;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const server = http.createServer(async (req, res) => {
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath === "/" || urlPath === "") {
    res.writeHead(302, { Location: `${BASE_PATH}/` });
    return res.end();
  }
  if (!urlPath.startsWith(BASE_PATH)) {
    res.writeHead(404);
    return res.end("Not found (requests must start with the base path).");
  }
  let rel = urlPath.slice(BASE_PATH.length) || "/";
  let fp = path.join(ROOT, rel);
  try {
    const stat = await fs.stat(fp).catch(() => null);
    if (stat?.isDirectory()) fp = path.join(fp, "index.html");
    else if (!stat && !path.extname(fp)) fp = `${fp.replace(/\/$/, "")}/index.html`;
    const data = await fs.readFile(fp);
    res.writeHead(200, {
      "content-type": TYPES[path.extname(fp)] || "application/octet-stream",
    });
    res.end(data);
  } catch {
    try {
      const notFound = await fs.readFile(path.join(ROOT, "404.html"));
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      res.end(notFound);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  }
});

server.listen(PORT, () => {
  console.log(`\n  Better Taro 75 preview → http://localhost:${PORT}${BASE_PATH}/\n`);
});
