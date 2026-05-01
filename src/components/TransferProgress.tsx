import { ArrowDown, ArrowUp, X, CheckCircle2, RefreshCw } from "lucide-react";
import { formatBytes, formatSpeed, formatTime } from "@/lib/format";
import type { ActiveTransfer } from "@/hooks/useRoom";

interface TransferProgressProps {
  transfer: ActiveTransfer;
  onCancel: () => void;
  onDismiss: () => void;
}

export function TransferProgress({ transfer, onCancel, onDismiss }: TransferProgressProps) {
  const pct = transfer.size > 0 ? Math.min(100, (transfer.transferred / transfer.size) * 100) : 0;
  const isDone = transfer.status === "done";
  const isActive = transfer.status === "active";

  return (
    <div className="bg-[#1A1D24] border border-white/[0.03] shadow-2xl shadow-black/50 rounded-[2.5rem] p-8 animate-float-in relative overflow-hidden">
      <div className="flex items-start gap-4 relative z-10">
        <div className={`flex h-14 w-14 items-center justify-center rounded-[1.2rem] shrink-0 border ${
          isDone ? "bg-green-500/10 border-green-500/20" : "bg-[#1A2542] border-[#3B6BEA]/20"
        }`}>
          {isDone ? (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : transfer.direction === "send" ? (
            <ArrowUp className="h-6 w-6 text-[#3B6BEA]" />
          ) : (
            <ArrowDown className="h-6 w-6 text-[#3B6BEA]" />
          )}
        </div>
        
        <div className="min-w-0 flex-1 py-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="truncate font-bold text-lg text-white">{transfer.name}</div>
            <div className="text-sm font-bold tabular-nums text-[#3B6BEA]">
              {pct.toFixed(0)}%
            </div>
          </div>
          <div className="text-[11px] font-bold text-[#5C6479] tracking-widest uppercase">
            {transfer.direction === "send" ? "Enviando" : "Recebendo"}
            {transfer.status !== "active" && ` · ${labelStatus(transfer.status)}`}
          </div>
        </div>

        {isActive && (
          <button 
            onClick={onCancel} 
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-[#8B92A5] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {!isActive && (
          <button 
            onClick={onDismiss} 
            className="flex items-center justify-center px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors text-sm"
          >
            Fechar
          </button>
        )}
      </div>

      <div className="w-full bg-white/5 rounded-full h-3 mt-6 mb-6 overflow-hidden relative z-10">
        <div 
          className={`h-full rounded-full transition-all duration-300 ease-out ${isDone ? 'bg-green-500' : 'bg-[#3B6BEA] shadow-[0_0_10px_rgba(59,107,234,0.5)]'}`} 
          style={{ width: `${pct}%` }} 
        />
      </div>

      <div className="grid grid-cols-3 gap-2 p-4 bg-white/[0.02] rounded-2xl border border-white/[0.02] relative z-10">
        <div>
          <div className="text-[11px] font-bold text-[#5C6479] tracking-widest uppercase mb-1">Transferido</div>
          <div className="text-white font-medium text-sm tabular-nums">
            {formatBytes(transfer.transferred)} / {formatBytes(transfer.size)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold text-[#5C6479] tracking-widest uppercase mb-1">Velocidade</div>
          <div className="text-white font-medium text-sm tabular-nums">
            {isActive ? formatSpeed(transfer.speed) : "—"}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold text-[#5C6479] tracking-widest uppercase mb-1">Restante</div>
          <div className="text-white font-medium text-sm tabular-nums">
            {isActive ? formatTime(transfer.eta) : "—"}
          </div>
        </div>
      </div>

      {/* Faded Background Icon */}
      <RefreshCw className="absolute -right-6 -bottom-10 text-white/[0.02] w-48 h-48 pointer-events-none -rotate-12" />
    </div>
  );
}

function labelStatus(s: ActiveTransfer["status"]) {
  switch (s) {
    case "done": return "Concluído";
    case "cancelled": return "Cancelado";
    case "error": return "Erro";
    default: return "";
  }
}
