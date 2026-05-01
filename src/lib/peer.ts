import Peer, { DataConnection } from "peerjs";

// Namespace prefix to avoid collisions on the public PeerJS broker.
const NS = "ftxr-";

export type PeerRole = "host" | "guest";

export interface PeerSetupOptions {
  roomCode: string;
  role: PeerRole;
  onOpen: (peerId: string) => void;
  onConnection: (conn: DataConnection) => void;
  onError: (err: Error) => void;
  onDisconnected?: () => void;
}

/**
 * Creates a PeerJS peer.
 * - Host registers with id = NS + roomCode (deterministic so guest can find it).
 * - Guest registers with random id and dials NS + roomCode.
 */
export function createPeer(opts: PeerSetupOptions): Peer {
  const hostId = NS + opts.roomCode.toUpperCase();
  const peer =
    opts.role === "host"
      ? new Peer(hostId, { debug: 1 })
      : new Peer({ debug: 1 });

  peer.on("open", (id) => {
    opts.onOpen(id);
    if (opts.role === "guest") {
      const conn = peer.connect(hostId, {
        reliable: true,
        serialization: "binary",
      });
      conn.on("open", () => opts.onConnection(conn));
      conn.on("error", (e) => opts.onError(e as Error));
    }
  });

  if (opts.role === "host") {
    peer.on("connection", (conn) => {
      conn.on("open", () => opts.onConnection(conn));
    });
  }

  peer.on("error", (err) => opts.onError(err as Error));
  peer.on("disconnected", () => opts.onDisconnected?.());

  return peer;
}
