import { ArrowLeft, Copy, Users, Zap, FileUp, Folder } from "lucide-react";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { FileDropZone } from "@/components/FileDropZone";
import { IncomingFileModal } from "@/components/IncomingFileModal";
import { TransferProgress } from "@/components/TransferProgress";
import { useRoom } from "@/hooks/useRoom";
import { toast } from "sonner";

interface RoomProps {
  userName: string;
  roomCode: string;
  role: "host" | "guest";
  onLeave: () => void;
}

export function Room({ userName, roomCode, role, onLeave }: RoomProps) {
  const room = useRoom({ userName, roomCode, role });
  const isFSAPISupported = typeof window !== "undefined" && "showSaveFilePicker" in window;

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success("Código copiado!");
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-[#0E1015] text-white font-sans selection:bg-[#3B6BEA]/30 flex flex-col">
      <div className="mx-auto w-full max-w-6xl space-y-8 relative z-10 flex-1 flex flex-col">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <button 
            onClick={onLeave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[1.25rem] bg-white/5 hover:bg-white/10 text-[#8B92A5] hover:text-white transition-colors border border-white/[0.05] text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" /> Sair da Sala
          </button>
          <ConnectionBadge state={room.state} ping={room.ping} />
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start flex-1">
          
          {/* Left Column: Info & Status */}
          <div className="space-y-8">
            {/* Header Card */}
            <header className="bg-[#1A1D24] rounded-[2.5rem] p-8 md:p-10 border border-white/[0.03] shadow-2xl shadow-black/50 relative overflow-hidden animate-float-in">
              <Folder className="absolute -right-10 -bottom-10 text-white/[0.02] w-64 h-64 pointer-events-none -rotate-12" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="text-[11px] font-bold text-[#5C6479] tracking-widest uppercase mb-3">Código da Sala</div>
                  <div className="font-mono text-5xl font-bold tracking-widest text-[#E5E5E5]">
                    {roomCode}
                  </div>
                </div>
                <button 
                  onClick={copyCode} 
                  title="Copiar código"
                  className="flex items-center justify-center h-14 w-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/[0.08] transition-all self-start sm:self-auto shrink-0"
                >
                  <Copy className="h-5 w-5 text-[#8B92A5]" />
                </button>
              </div>

              <div className="flex flex-col gap-4 pt-8 border-t border-white/[0.05] mt-8 relative z-10">
                <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-[1.5rem] border border-white/[0.02]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#1A2542] border border-[#3B6BEA]/20 shrink-0">
                    <Zap className="h-5 w-5 text-[#3B6BEA]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-[#5C6479] tracking-widest uppercase mb-1">Você</div>
                    <div className="font-semibold text-lg truncate">{userName}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-[1.5rem] border border-white/[0.02]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/5 border border-white/10 shrink-0">
                    <Users className={`h-5 w-5 ${room.peerName ? 'text-white' : 'text-[#5C6479]'}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-[#5C6479] tracking-widest uppercase mb-1">Conectado</div>
                    <div className={`font-semibold text-lg truncate ${!room.peerName && 'text-[#5C6479]'}`}>
                      {room.peerName ?? (room.state === "waiting" ? "Aguardando..." : "Conectando...")}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {!isFSAPISupported && (
              <div className="bg-red-500/10 rounded-[1.5rem] p-5 border border-red-500/20 text-sm text-red-400 font-medium">
                <strong className="text-red-300">Aviso importante:</strong> seu navegador não suporta a API de Sistema de Arquivos. 
                Recomendamos o uso do Chrome, Edge ou Opera para receber os arquivos diretamente no disco e evitar travamentos.
              </div>
            )}

            {room.transfer && (
              <div className="animate-float-in">
                <TransferProgress
                  transfer={room.transfer}
                  onCancel={room.cancelTransfer}
                  onDismiss={room.dismissTransfer}
                />
              </div>
            )}
          </div>

          {/* Right Column: File Drop Zone */}
          <div className="h-full">
            <section className="bg-[#1A1D24] rounded-[2.5rem] p-8 md:p-10 border border-white/[0.03] shadow-2xl shadow-black/50 animate-float-in relative overflow-hidden h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-2.5 bg-[#1A2542] rounded-xl border border-[#3B6BEA]/20">
                  <FileUp className="text-[#3B6BEA]" size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Enviar Arquivo</h2>
              </div>
              
              <div className="flex-1 flex flex-col relative z-10">
                <FileDropZone
                  onFile={room.sendFile}
                  disabled={room.state !== "connected" || (room.transfer?.status === "active")}
                />
              </div>
            </section>
          </div>

        </div>

        <IncomingFileModal
          offer={room.incoming}
          fromName={room.peerName ?? "Usuário"}
          onAccept={room.acceptIncoming}
          onReject={room.rejectIncoming}
        />
      </div>

      {/* Decorative background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#3B6BEA]/5 rounded-full blur-[150px]"></div>
      </div>
    </div>
  );
}
