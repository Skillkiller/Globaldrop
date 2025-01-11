import { Server } from "ws";
import { IClient, ExpressPeerServer } from "peer";
import { IncomingMessage } from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

interface WebSocketPlus extends WebSocket {
  room: string | null;
}

const port = process.env.PORT || 9000;
const app = express();
const server = app.listen(port, () => {
  console.log(`Started server on port ${port}`);
});

app.get(
  "/room",
  cors({
    origin: process.env.ROOM_ORIGIN,
    methods: "GET",
  }),
  (req, res) => {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.send(getClientsInRoom(extractIp(req)));
  }
);


const peerServer = ExpressPeerServer(server, {
  generateClientId: customIdentGeneration,
  createWebSocketServer: (options) => {
    const server = new Server(options);
    server.on("connection", (ws, req) => {
      (ws as unknown as WebSocketPlus).room = extractIp(req);
    });
    return server;
  },
});
app.use("/peer", peerServer);

function customIdentGeneration() {
  const randomNumber = Math.floor(Math.random() * 1000000);
  return randomNumber.toString().padStart(6, "0");
}

const rooms: Record<string, Set<string>> = {};

function extractIp(req: IncomingMessage): string | null {
  let tmpIp: string | undefined;
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    if (Array.isArray(xForwardedFor)) {
      tmpIp = xForwardedFor[0].split(/\s*,\s*/)[0];
    } else {
      tmpIp = xForwardedFor.split(/\s*,\s*/)[0];
    }
  } else {
    if (req.socket.remoteAddress) {
      tmpIp = req.socket.remoteAddress;
    }
  }

  if (tmpIp) {
    return isLocalhost(tmpIp) ? "127.0.0.1" : tmpIp;
  }
  return null;
}

function isLocalhost(ip: string): boolean {
  return ip === "::1" || ip === "::ffff:127.0.0.1" || ip === "127.0.0.1";
}

function joinRoom(room: string | null, client: IClient) {
  if (!room) return;

  // Create empty room if not already present
  if (!rooms[room]) {
    rooms[room] = new Set();
  }

  rooms[room].add(client.getId());
}

function quitRoom(room: string | null, client: IClient) {
  if (!room) return;

  if (rooms[room]) {
    rooms[room].delete(client.getId());

    // Remove empty room
    if (rooms[room].size === 0) {
      delete rooms[room];
    }
  }
}

function getClientsInRoom(room: string | null): string[] {
  if (!room || !rooms[room]) return [];
  return Array.from(rooms[room]);
}

peerServer.on("connection", (client) => {
  joinRoom((client.getSocket() as unknown as WebSocketPlus).room, client);
});

peerServer.on("disconnect", (client) => {
  quitRoom((client.getSocket() as unknown as WebSocketPlus).room, client);
});
