import { useCallback, useEffect, useRef, useState } from "react";
import type { DataConnection } from "peerjs";
import type Peer from "peerjs";
import { createPeer, type PeerRole } from "@/lib/peer";
import {
  ControlMessage,
  FileReceiver,
  FileSender,
  sendControl,
  uid,
} from "@/lib/transfer";
import { toast } from "sonner";

export type ConnState = "idle" | "connecting" | "waiting" | "connected" | "error";

export interface IncomingOffer {
  transferId: string;
  name: string;
  size: number;
  type: string;
}

export interface ActiveTransfer {
  transferId: string;
  direction: "send" | "receive";
  name: string;
  size: number;
  transferred: number;
  startedAt: number;
  status: "active" | "done" | "cancelled" | "error";
  speed: number;
  eta: number;
}

interface UseRoomOpts {
  userName: string;
  roomCode: string;
  role: PeerRole;
}

export function useRoom({ userName, roomCode, role }: UseRoomOpts) {
  const [state, setState] = useState<ConnState>("idle");
  const [peerName, setPeerName] = useState<string | null>(null);
  const [ping, setPing] = useState<number | null>(null);
  const [incoming, setIncoming] = useState<IncomingOffer | null>(null);
  const [transfer, setTransfer] = useState<ActiveTransfer | null>(null);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const senderRef = useRef<FileSender | null>(null);
  const receiverRef = useRef<FileReceiver | null>(null);
  const speedRef = useRef<{ lastT: number; lastBytes: number }>({ lastT: 0, lastBytes: 0 });

  const cleanup = useCallback(() => {
    try {
      connRef.current?.close();
    } catch {/* noop */}
    try {
      peerRef.current?.destroy();
    } catch {/* noop */}
    connRef.current = null;
    peerRef.current = null;
    senderRef.current = null;
    receiverRef.current = null;
  }, []);

  useEffect(() => {
    console.log(`[ROOM] ▶ init role=${role} room="${roomCode}" user="${userName}"`);
    setState("connecting");
    const peer = createPeer({
      roomCode,
      role,
      onOpen: () => {
        console.log(`[ROOM] ✅ peer aberto (role=${role})`);
        if (role === "host") setState("waiting");
      },
      onConnection: (conn) => {
        console.log("[ROOM] 🔗 conexão estabelecida com peer");
        connRef.current = conn;
        setState("connected");
        sendControl(conn, { kind: "hello", name: userName });

        conn.on("data", (raw) => handleData(raw));
        conn.on("close", () => {
          console.log("[ROOM] 🔌 conexão fechada");
          setState("idle");
          setPeerName(null);
          toast.error("Conexão encerrada");
        });
        conn.on("error", (err) => {
          console.error("[ROOM] ❌ erro na conexão:", err);
          setState("error");
        });
      },
      onError: (err) => {
        console.error("[ROOM] ❌ peer error:", err);
        const msg = (err as Error).message || "";
        if (msg.includes("ID") && role === "host") {
          toast.error("Esta sala já existe. Tente outro código.");
        } else if (msg.includes("Could not connect to peer")) {
          toast.error("Sala não encontrada.");
        } else {
          toast.error("Erro de conexão: " + msg);
        }
        setState("error");
      },
      onDisconnected: () => {
        console.warn("[ROOM] ⚠ peer desconectado, tentando reconectar...");
        peer.reconnect();
      },
    });
    peerRef.current = peer;

    return () => {
      console.log("[ROOM] 🧹 cleanup");
      cleanup();
    };
  }, [roomCode, role, userName, cleanup]);

  useEffect(() => {
    if (state !== "connected") return;
    const interval = setInterval(() => {
      if (connRef.current) {
        sendControl(connRef.current, { kind: "ping", t: performance.now() });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [state]);

  const handleData = useCallback(
    (raw: unknown) => {
      const conn = connRef.current;
      if (!conn) return;

      if (raw instanceof ArrayBuffer || raw instanceof Blob || ArrayBuffer.isView(raw)) {
        const sz = raw instanceof Blob ? raw.size : raw.byteLength;
        const kind =
          raw instanceof Blob
            ? "Blob"
            : raw instanceof ArrayBuffer
              ? "ArrayBuffer"
              : raw.constructor?.name || "ArrayBufferView";
        console.log(`[ROOM] 📦 binário recebido tipo=${kind} size=${sz}B`);
        if (!receiverRef.current) {
          console.warn(`[ROOM] ⚠ binário recebido sem receiver ativo (${sz}B)`);
        }
        receiverRef.current?.handleBinary(raw);
        return;
      }

      const msg = raw as ControlMessage;
      if (msg.kind !== "ping" && msg.kind !== "pong" && msg.kind !== "progress" && msg.kind !== "chunk-meta") {
        console.log("[CTRL ◀ recv]", msg);
      }
      switch (msg.kind) {
        case "hello":
          console.log(`[ROOM] 👋 hello de "${msg.name}"`);
          setPeerName(msg.name);
          break;
        case "ping":
          sendControl(conn, { kind: "pong", t: msg.t });
          break;
        case "pong":
          setPing(Math.round(performance.now() - msg.t));
          break;
        case "offer":
          console.log(
            `[ROOM] 📨 offer recebido name="${msg.name}" size=${msg.size}B (${(msg.size / 1048576).toFixed(2)} MB)`,
          );
          setIncoming({
            transferId: msg.transferId,
            name: msg.name,
            size: msg.size,
            type: msg.type,
          });
          try {
            new Audio(
              "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAA",
            ).play().catch(() => {});
          } catch {/* noop */}
          break;
        case "accept":
          console.log("[ROOM] ✅ peer aceitou a transferência");
          break;
        case "reject":
          console.log("[ROOM] ❌ peer recusou a transferência");
          toast.error("Transferência recusada");
          setTransfer(null);
          senderRef.current = null;
          break;
        case "cancel":
          console.log("[ROOM] 🛑 peer cancelou transferência");
          toast.warning("Transferência cancelada");
          setIncoming(null);
          if (receiverRef.current) {
            receiverRef.current.cancel();
            receiverRef.current = null;
          }
          setTransfer((t) => (t ? { ...t, status: "cancelled" } : t));
          break;
        case "chunk-meta":
          receiverRef.current?.setPendingMeta(msg);
          break;
        case "progress":
          break;
        case "complete":
          console.log("[ROOM] 🏁 sender sinalizou complete");
          void receiverRef.current?.markComplete();
          break;
      }
    },
    [],
  );

  const updateSpeed = useCallback((bytes: number, total: number) => {
    const now = performance.now();
    const last = speedRef.current;
    let speed = 0;
    if (last.lastT) {
      const dt = (now - last.lastT) / 1000;
      if (dt > 0.25) {
        speed = (bytes - last.lastBytes) / dt;
        speedRef.current = { lastT: now, lastBytes: bytes };
      } else {
        return;
      }
    } else {
      speedRef.current = { lastT: now, lastBytes: bytes };
    }
    setTransfer((t) =>
      t
        ? {
            ...t,
            transferred: bytes,
            speed: speed || t.speed,
            eta: speed > 0 ? (total - bytes) / speed : t.eta,
          }
        : t,
    );
  }, []);

  const sendFile = useCallback(
    async (file: File) => {
      const conn = connRef.current;
      if (!conn) return;
      const transferId = uid();
      sendControl(conn, {
        kind: "offer",
        transferId,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
      });

      const sender = new FileSender(conn, file, transferId, {
        onProgress: (sent, total) => updateSpeed(sent, total),
        onDone: () => {
          setTransfer((t) => (t ? { ...t, status: "done", transferred: t.size } : t));
          toast.success("Arquivo enviado!");
          senderRef.current = null;
        },
        onCancel: () => {
          setTransfer((t) => (t ? { ...t, status: "cancelled" } : t));
        },
        onError: (e) => {
          toast.error("Erro no envio: " + e.message);
          setTransfer((t) => (t ? { ...t, status: "error" } : t));
        },
      });
      senderRef.current = sender;

      setTransfer({
        transferId,
        direction: "send",
        name: file.name,
        size: file.size,
        transferred: 0,
        startedAt: Date.now(),
        status: "active",
        speed: 0,
        eta: Infinity,
      });
      speedRef.current = { lastT: 0, lastBytes: 0 };

      const result = await waitForAcceptance(conn, transferId);
      if (!result) {
        senderRef.current = null;
        setTransfer(null);
        return;
      }
      sender.start();
    },
    [updateSpeed],
  );

  const acceptIncoming = useCallback(
    async (offer: IncomingOffer) => {
      const conn = connRef.current;
      if (!conn) return;

      try {
        // @ts-expect-error - showSaveFilePicker exists in modern Chromium
        const handle: FileSystemFileHandle = await window.showSaveFilePicker({
          suggestedName: offer.name,
        });

        const receiver = new FileReceiver(
          offer.transferId,
          offer.name,
          offer.size,
          offer.type,
          conn,
          {
            onProgress: (recv, total) => updateSpeed(recv, total),
            onDone: () => {
              setTransfer((t) => (t ? { ...t, status: "done", transferred: t.size } : t));
              toast.success("Arquivo recebido e salvo!");
              receiverRef.current = null;
            },
            onCancel: () => {
              setTransfer((t) => (t ? { ...t, status: "cancelled" } : t));
            },
            onError: (e) => {
              toast.error("Erro ao receber: " + e.message);
              setTransfer((t) => (t ? { ...t, status: "error" } : t));
            },
          },
        );
        await receiver.openWriter(handle);
        receiverRef.current = receiver;

        setTransfer({
          transferId: offer.transferId,
          direction: "receive",
          name: offer.name,
          size: offer.size,
          transferred: 0,
          startedAt: Date.now(),
          status: "active",
          speed: 0,
          eta: Infinity,
        });
        speedRef.current = { lastT: 0, lastBytes: 0 };
        setIncoming(null);
        sendControl(conn, { kind: "accept", transferId: offer.transferId });
      } catch (e) {
        toast.error("Local de salvamento não selecionado");
        sendControl(conn, { kind: "reject", transferId: offer.transferId });
        setIncoming(null);
      }
    },
    [updateSpeed],
  );

  const rejectIncoming = useCallback((offer: IncomingOffer) => {
    const conn = connRef.current;
    if (!conn) return;
    sendControl(conn, { kind: "reject", transferId: offer.transferId });
    setIncoming(null);
  }, []);

  const cancelTransfer = useCallback(() => {
    if (senderRef.current) {
      senderRef.current.cancel();
      senderRef.current = null;
    }
    if (receiverRef.current) {
      const conn = connRef.current;
      const id = receiverRef.current.transferId;
      receiverRef.current.cancel();
      receiverRef.current = null;
      if (conn) sendControl(conn, { kind: "cancel", transferId: id });
    }
    setTransfer((t) => (t ? { ...t, status: "cancelled" } : t));
  }, []);

  const dismissTransfer = useCallback(() => setTransfer(null), []);

  return {
    state,
    peerName,
    ping,
    incoming,
    transfer,
    sendFile,
    acceptIncoming,
    rejectIncoming,
    cancelTransfer,
    dismissTransfer,
  };
}

function waitForAcceptance(conn: DataConnection, transferId: string): Promise<boolean> {
  return new Promise((resolve) => {
    const handler = (raw: unknown) => {
      if (typeof raw !== "object" || !raw) return;
      const msg = raw as ControlMessage;
      if ("transferId" in msg && msg.transferId !== transferId) return;
      if (msg.kind === "accept") {
        conn.off("data", handler);
        resolve(true);
      } else if (msg.kind === "reject" || msg.kind === "cancel") {
        conn.off("data", handler);
        resolve(false);
      }
    };
    conn.on("data", handler);
  });
}
