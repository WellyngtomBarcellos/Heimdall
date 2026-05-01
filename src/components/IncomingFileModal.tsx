import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileIcon, Check, X, Download } from "lucide-react";
import { formatBytes } from "@/lib/format";
import type { IncomingOffer } from "@/hooks/useRoom";

interface IncomingFileModalProps {
  offer: IncomingOffer | null;
  fromName: string;
  onAccept: (o: IncomingOffer) => void;
  onReject: (o: IncomingOffer) => void;
}

export function IncomingFileModal({ offer, fromName, onAccept, onReject }: IncomingFileModalProps) {
  return (
    <Dialog open={!!offer} onOpenChange={(o) => { if (!o && offer) onReject(offer); }}>
      <DialogContent className="bg-[#1A1D24] border border-white/[0.05] shadow-2xl shadow-black text-white sm:rounded-[2.5rem] p-8 max-w-sm overflow-hidden">
        <DialogHeader className="space-y-3 relative z-10">
          <div className="w-16 h-16 bg-[#1A2542] rounded-2xl border border-[#3B6BEA]/20 flex items-center justify-center mb-2 mx-auto">
            <Download className="text-[#3B6BEA] h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-center">Arquivo Recebido</DialogTitle>
          <DialogDescription className="text-center text-[#8B92A5] text-base">
            <span className="font-semibold text-white">{fromName}</span> quer te enviar um arquivo
          </DialogDescription>
        </DialogHeader>

        {offer && (
          <div className="space-y-6 pt-4 relative z-10">
            <div className="flex items-center gap-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/5">
                <FileIcon className="h-6 w-6 text-[#8B92A5]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-white">{offer.name}</div>
                <div className="text-sm font-medium text-[#5C6479]">{formatBytes(offer.size)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onReject(offer)}
                className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-[#8B92A5] hover:text-white font-semibold transition-colors border border-white/[0.05]"
              >
                <X className="h-4 w-4" /> Recusar
              </button>
              <button 
                onClick={() => onAccept(offer)}
                className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-[#3B6BEA] hover:bg-[#3B6BEA]/90 text-white font-semibold shadow-lg shadow-[#3B6BEA]/25 transition-all"
              >
                <Check className="h-4 w-4" /> Aceitar
              </button>
            </div>
            <p className="text-xs font-medium text-[#5C6479] text-center">
              Você poderá escolher onde salvar
            </p>
          </div>
        )}

        {/* Faded Background Icon */}
        <Download className="absolute -right-12 -bottom-12 text-white/[0.02] w-64 h-64 pointer-events-none -rotate-12" />
      </DialogContent>
    </Dialog>
  );
}
