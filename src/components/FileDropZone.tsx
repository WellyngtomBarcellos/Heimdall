import { useCallback, useRef, useState } from "react";
import { Upload, FileIcon, FolderIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  collectFromDataTransfer,
  collectFromFileList,
  packAsZip,
  suggestZipName,
  type CollectedEntry,
} from "@/lib/folder";
import { toast } from "sonner";

interface FileDropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

interface PickedState {
  entries: CollectedEntry[];
  totalBytes: number;
  isFolder: boolean;
  /** Nome sugerido caso vire zip */
  zipName: string;
}

export function FileDropZone({ onFile, disabled }: FileDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [picked, setPicked] = useState<PickedState | null>(null);
  const [packing, setPacking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const setEntries = useCallback((entries: CollectedEntry[]) => {
    if (entries.length === 0) return;
    const totalBytes = entries.reduce((s, e) => s + e.file.size, 0);
    const isFolder =
      entries.length > 1 ||
      entries.some((e) => e.path.includes("/"));
    setPicked({
      entries,
      totalBytes,
      isFolder,
      zipName: suggestZipName(entries),
    });
  }, []);

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    try {
      const entries = await collectFromDataTransfer(e.dataTransfer);
      setEntries(entries);
    } catch (err) {
      console.error("[DROPZONE] erro ao ler drop:", err);
      toast.error("Não foi possível ler os arquivos arrastados");
    }
  };

  const handleSend = async () => {
    if (!picked) return;
    try {
      let fileToSend: File;
      if (picked.isFolder || picked.entries.length > 1) {
        setPacking(true);
        toast.message("Compactando em ZIP…");
        fileToSend = await packAsZip(picked.entries, picked.zipName);
      } else {
        fileToSend = picked.entries[0].file;
      }
      onFile(fileToSend);
      setPicked(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (folderInputRef.current) folderInputRef.current.value = "";
    } catch (e) {
      console.error("[DROPZONE] erro ao empacotar:", e);
      toast.error("Falha ao preparar pacote");
    } finally {
      setPacking(false);
    }
  };

  const fileCount = picked?.entries.length ?? 0;

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "block rounded-[2rem] border-2 border-dashed p-10 text-center transition-all",
          "border-white/[0.08] bg-white/[0.02]",
          !disabled && "hover:bg-white/[0.04]",
          dragOver && "border-[#3B6BEA] bg-[#3B6BEA]/10 scale-[1.01]",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => setEntries(collectFromFileList(e.target.files ?? new FileList()))}
        />
        <input
          ref={folderInputRef}
          type="file"
          className="hidden"
          // @ts-expect-error - atributos não-padrão para selecionar pastas
          webkitdirectory=""
          directory=""
          multiple
          disabled={disabled}
          onChange={(e) => setEntries(collectFromFileList(e.target.files ?? new FileList()))}
        />

        <div className="flex flex-col items-center gap-4 text-[#8B92A5]">
          {picked ? (
            <>
              {picked.isFolder ? (
                <div className="p-4 bg-[#1A2542] rounded-2xl border border-[#3B6BEA]/20">
                  <FolderIcon className="h-10 w-10 text-[#3B6BEA]" />
                </div>
              ) : (
                <div className="p-4 bg-[#1A2542] rounded-2xl border border-[#3B6BEA]/20">
                  <FileIcon className="h-10 w-10 text-[#3B6BEA]" />
                </div>
              )}
              <div className="text-white font-semibold text-lg break-all max-w-full">
                {picked.isFolder
                  ? `${fileCount} arquivo${fileCount > 1 ? "s" : ""} • será enviado como ${picked.zipName}`
                  : picked.entries[0].file.name}
              </div>
              <div className="text-sm font-medium text-[#5C6479] bg-white/5 px-3 py-1 rounded-full">{formatBytes(picked.totalBytes)}</div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setPicked(null);
                }}
                disabled={packing}
                className="mt-2 flex items-center justify-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" /> Remover seleção
              </button>
            </>
          ) : (
            <>
              <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.05] mb-2">
                <Upload className="h-10 w-10 text-[#5C6479]" />
              </div>
              <div className="text-white font-semibold text-lg">
                Arraste arquivos ou pastas aqui
              </div>
              <div className="text-sm font-medium text-[#5C6479]">ou use os botões abaixo para selecionar</div>
            </>
          )}
        </div>
      </div>

      {!picked && (
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors border border-white/[0.05] disabled:opacity-50"
          >
            <FileIcon className="h-5 w-5 text-[#8B92A5]" /> Escolher arquivos
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors border border-white/[0.05] disabled:opacity-50"
          >
            <FolderIcon className="h-5 w-5 text-[#8B92A5]" /> Escolher pasta
          </button>
        </div>
      )}

      <button
        className="flex items-center justify-center gap-2 w-full h-16 rounded-2xl bg-[#3B6BEA] hover:bg-[#3B6BEA]/90 text-white font-bold text-lg shadow-lg shadow-[#3B6BEA]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!picked || disabled || packing}
        onClick={handleSend}
      >
        {packing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Compactando para envio...
          </>
        ) : picked?.isFolder ? (
          "Compactar e Enviar Pasta"
        ) : (
          "Enviar Arquivo"
        )}
      </button>
    </div>
  );
}
