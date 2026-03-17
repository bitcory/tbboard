import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { join, extname } from "path";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const UPLOAD_DIR = dev
  ? join(process.cwd(), "public", "uploads")
  : "/app/data/uploads";

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // Serve uploaded files from volume in production
    if (!dev && req.url?.startsWith("/uploads/")) {
      const filename = req.url.slice("/uploads/".length);
      const filePath = join(UPLOAD_DIR, filename);
      if (existsSync(filePath) && statSync(filePath).isFile()) {
        const ext = extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        });
        res.end(readFileSync(filePath));
        return;
      }
    }
    handler(req, res);
  });

  const io = new Server(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
  });

  globalThis.__io = io;

  let viewerCount = 0;

  io.on("connection", (socket) => {
    viewerCount++;
    io.emit("viewers:count", viewerCount);

    socket.on("disconnect", () => {
      viewerCount--;
      io.emit("viewers:count", viewerCount);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
