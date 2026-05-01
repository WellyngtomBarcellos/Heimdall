import { Wifi, WifiOff, Loader2, Activity } from "lucide-react";
import type { ConnState } from "@/hooks/useRoom";

interface ConnectionBadgeProps {
  state: ConnState;
  ping: number | null;
}

export function ConnectionBadge({ state, ping }: ConnectionBadgeProps) {
  const label = (() => {
    switch (state) {
      case "connecting": return "Conectando...";
      case "waiting": return "Aguardando outro usuário...";
      case "connected": return "Usuário conectado";
      case "error": return "Erro de conexão";
      default: return "Desconectado";
    }
  })();

  const dotColor =
    state === "connected" ? "bg-green-500" :
    state === "waiting" ? "bg-[#3B6BEA]" :
    state === "error" ? "bg-red-500" :
    "bg-slate-500";

  return (
    <div className="bg-white/5 inline-flex items-center gap-3 rounded-[1.25rem] px-5 py-2.5 text-sm border border-white/[0.05]">
      <span className={`relative flex h-2.5 w-2.5`}>
        <span className={`absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75 animate-pulse-dot`} />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dotColor}`} />
      </span>
      <span className="text-[#8B92A5] font-medium">{label}</span>
      {state === "connected" && ping !== null && (
        <span className="flex items-center gap-1 text-[11px] font-bold text-[#5C6479] border-l border-white/10 pl-3 ml-1">
          <Activity className="h-3.5 w-3.5" />
          {ping}ms
        </span>
      )}
      {state === "connecting" && <Loader2 className="h-4 w-4 animate-spin text-[#8B92A5]" />}
      {state === "error" && <WifiOff className="h-4 w-4 text-red-500" />}
      {state === "connected" && <Wifi className="h-4 w-4 text-green-500" />}
    </div>
  );
}
