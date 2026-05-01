/**
 * Helpers para coletar arquivos de pastas (drag-and-drop e <input webkitdirectory>)
 * e empacotá-los em um único File .zip via streaming (client-zip).
 */
import { downloadZip } from "client-zip";

export interface CollectedEntry {
  /** Caminho relativo dentro do "pacote" (ex: "minha-pasta/sub/foto.jpg") */
  path: string;
  file: File;
}

// ---------- Coleta a partir de DataTransfer (drag & drop) ----------

interface FSEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
  file?: (cb: (f: File) => void, err: (e: unknown) => void) => void;
  createReader?: () => {
    readEntries: (cb: (entries: FSEntry[]) => void, err: (e: unknown) => void) => void;
  };
}

async function readAllEntries(reader: NonNullable<ReturnType<NonNullable<FSEntry["createReader"]>>>): Promise<FSEntry[]> {
  const all: FSEntry[] = [];
  while (true) {
    const batch: FSEntry[] = await new Promise((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });
    if (batch.length === 0) break;
    all.push(...batch);
  }
  return all;
}

async function walkEntry(entry: FSEntry, basePath: string, out: CollectedEntry[]) {
  if (entry.isFile && entry.file) {
    const file: File = await new Promise((resolve, reject) => {
      entry.file!(resolve, reject);
    });
    out.push({ path: basePath + entry.name, file });
  } else if (entry.isDirectory && entry.createReader) {
    const reader = entry.createReader();
    const children = await readAllEntries(reader);
    const sub = basePath + entry.name + "/";
    for (const child of children) await walkEntry(child, sub, out);
  }
}

export async function collectFromDataTransfer(dt: DataTransfer): Promise<CollectedEntry[]> {
  const items = dt.items;
  const out: CollectedEntry[] = [];
  if (items && items.length > 0 && typeof (items[0] as unknown as { webkitGetAsEntry?: () => unknown }).webkitGetAsEntry === "function") {
    const entries: FSEntry[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.kind !== "file") continue;
      const entry = (it as unknown as { webkitGetAsEntry: () => FSEntry | null }).webkitGetAsEntry();
      if (entry) entries.push(entry);
    }
    for (const entry of entries) await walkEntry(entry, "", out);
    return out;
  }
  // Fallback: somente arquivos soltos (sem suporte a pastas)
  const files = dt.files;
  for (let i = 0; i < files.length; i++) {
    out.push({ path: files[i].name, file: files[i] });
  }
  return out;
}

// ---------- Coleta a partir de <input> (com ou sem webkitdirectory) ----------

export function collectFromFileList(files: FileList): CollectedEntry[] {
  const out: CollectedEntry[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    // webkitRelativePath existe quando o input usa "webkitdirectory"
    const rel = (f as unknown as { webkitRelativePath?: string }).webkitRelativePath;
    out.push({ path: rel && rel.length > 0 ? rel : f.name, file: f });
  }
  return out;
}

// ---------- Empacotamento em ZIP streaming ----------

/**
 * Cria um File .zip a partir de várias entradas, usando streaming.
 * O conteúdo é materializado em memória apenas se o navegador não suportar
 * Response.blob() em streaming — para a maioria dos casos modernos isso
 * acontece sem custo adicional além do necessário.
 *
 * Alternativa: poderíamos transmitir o stream direto pelo DataChannel,
 * mas o pipeline atual usa File.stream() — então geramos um Blob/File final.
 */
export async function packAsZip(
  entries: CollectedEntry[],
  zipName: string,
): Promise<File> {
  console.log(
    `[FOLDER] 📦 zip in: ${entries.length} arquivos → "${zipName}"`,
    entries.map((e) => e.path),
  );

  // client-zip aceita objetos com { name, input, lastModified }
  const inputs = entries.map((e) => ({
    name: e.path,
    input: e.file,
    lastModified: new Date(e.file.lastModified || Date.now()),
  }));

  const zipResponse = downloadZip(inputs);
  const blob = await zipResponse.blob();
  console.log(`[FOLDER] ✅ zip pronto: ${(blob.size / 1048576).toFixed(2)} MB`);
  return new File([blob], zipName, { type: "application/zip" });
}

export function suggestZipName(entries: CollectedEntry[]): string {
  if (entries.length === 0) return "arquivos.zip";
  // Se todas as entradas estão sob a mesma pasta-raiz, use o nome dela.
  const first = entries[0].path;
  const slash = first.indexOf("/");
  if (slash > 0) {
    const root = first.slice(0, slash);
    if (entries.every((e) => e.path.startsWith(root + "/"))) {
      return `${root}.zip`;
    }
  }
  if (entries.length === 1) {
    // Único arquivo — não deveria chegar aqui (envia direto), mas por segurança:
    return entries[0].file.name + ".zip";
  }
  return "arquivos.zip";
}
