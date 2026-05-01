import { useState } from "react";
import { Zap, Plus, LogIn, Sparkles, Send, Shield, Github, Rocket, Lock } from "lucide-react";
import { generateRoomCode } from "@/lib/format";
import { toast } from "sonner";

interface LobbyProps {
  onJoin: (opts: { name: string; code: string; role: "host" | "guest" }) => void;
}

export function Lobby({ onJoin }: LobbyProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const validate = () => {
    if (!name.trim()) {
      toast.error("Digite seu nome");
      return false;
    }
    if (name.length > 30) {
      toast.error("Nome muito longo");
      return false;
    }
    return true;
  };

  const handleCreate = () => {
    if (!validate()) return;
    const newCode = generateRoomCode();
    onJoin({ name: name.trim(), code: newCode, role: "host" });
  };

  const handleJoin = () => {
    if (!validate()) return;
    const c = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,12}$/.test(c)) {
      toast.error("Código inválido");
      return;
    }
    onJoin({ name: name.trim(), code: c, role: "guest" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 md:pt-24 pb-20 p-6 bg-[#0E1015] text-white font-sans selection:bg-[#3B6BEA]/30 overflow-x-hidden">
      
      {/* Hero Section (Join/Create Room) */}
      <div className="w-full max-w-6xl animate-float-in relative z-10 mb-32 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* Left Side: Brand & Intro */}
        <header className="text-center lg:text-left space-y-6">
          <div className="flex flex-col lg:flex-row items-center gap-6 justify-center lg:justify-start">
            <img src="/assets/logo.png" alt="Heimdall Logo" className="h-16 md:h-20 w-auto object-contain drop-shadow-xl" />
            <h1 className="text-[4rem] md:text-[5rem] leading-[1.1] font-bold tracking-tighter text-[#E5E5E5]">
              Heimdall
            </h1>
          </div>
          <p className="text-[#8B92A5] text-lg md:text-xl font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Compartilhe arquivos de qualquer tamanho diretamente entre dispositivos, de forma instantânea e totalmente segura.
          </p>
          <div className="inline-flex items-center gap-2 bg-[#1A1D24] border border-white/[0.05] px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4 text-[#3B6BEA]" />
            <span className="text-[#8B92A5] text-sm font-medium">Transferência P2P Direta</span>
          </div>
        </header>

        {/* Right Side: Form Card */}
        <div className="bg-[#1A1D24] rounded-[2.5rem] p-8 md:p-10 space-y-6 shadow-2xl shadow-black/50 border border-white/[0.03] w-full max-w-md mx-auto relative overflow-hidden">
          <Send className="absolute -right-16 -bottom-16 text-white/[0.02] w-64 h-64 pointer-events-none -rotate-12" />
          
          <div className="space-y-2 relative z-10">
            <label htmlFor="name" className="text-[#8B92A5] font-semibold text-sm ml-1">Seu nome</label>
            <input
              id="name"
              placeholder="Como devo te chamar?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              className="w-full h-14 bg-white/[0.03] border border-white/[0.08] rounded-[1.25rem] px-5 text-white placeholder:text-[#5C6479] focus:outline-none focus:border-[#3B6BEA] focus:ring-1 focus:ring-[#3B6BEA] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="code" className="text-[#8B92A5] font-semibold text-sm ml-1">Código da sala</label>
            <input
              id="code"
              placeholder="EX: A7K2QZ"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={12}
              className="w-full h-14 bg-white/[0.03] border border-white/[0.08] rounded-[1.25rem] px-5 text-white placeholder:text-[#5C6479] focus:outline-none focus:border-[#3B6BEA] focus:ring-1 focus:ring-[#3B6BEA] transition-all font-mono tracking-widest text-center uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button 
              onClick={handleCreate}
              className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors border border-white/[0.05]"
            >
              <Plus className="h-4 w-4 text-[#8B92A5]" /> Criar sala
            </button>
            <button 
              onClick={handleJoin} 
              disabled={!code.trim()}
              className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-[#3B6BEA] hover:bg-[#3B6BEA]/90 text-white font-semibold shadow-lg shadow-[#3B6BEA]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="h-4 w-4" /> Entrar
            </button>
          </div>
        </div>
      </div>

      {/* Information Sections */}
      <div className="w-full max-w-5xl space-y-24 relative z-10 animate-float-in" style={{ animationDelay: "0.2s" }}>
        
        {/* Section 1: Features Grid */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Como o Heimdall funciona?</h2>
            <p className="text-[#8B92A5] text-lg max-w-2xl mx-auto">
              Diferente de serviços como Google Drive ou WeTransfer, o Heimdall <strong className="text-white font-semibold">não faz upload</strong> dos seus arquivos para nenhum servidor na nuvem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1A1D24] rounded-[2rem] p-8 border border-white/[0.03] shadow-xl hover:bg-white/[0.03] transition-colors">
              <div className="p-3 bg-[#1A2542] rounded-2xl w-fit mb-6 border border-[#3B6BEA]/20">
                <Rocket className="text-[#3B6BEA] h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Ponto a Ponto (P2P)</h3>
              <p className="text-[#8B92A5] text-sm leading-relaxed">
                Os dados viajam diretamente do seu navegador para o navegador do destinatário. Sem intermediários, usando o máximo da velocidade da sua internet.
              </p>
            </div>

            <div className="bg-[#1A1D24] rounded-[2rem] p-8 border border-white/[0.03] shadow-xl hover:bg-white/[0.03] transition-colors">
              <div className="p-3 bg-[#1A2542] rounded-2xl w-fit mb-6 border border-[#3B6BEA]/20">
                <Lock className="text-[#3B6BEA] h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Privacidade Total</h3>
              <p className="text-[#8B92A5] text-sm leading-relaxed">
                A conexão WebRTC é criptografada de ponta a ponta. Como os arquivos nunca são armazenados, não há risco de vazamento de dados.
              </p>
            </div>

            <div className="bg-[#1A1D24] rounded-[2rem] p-8 border border-white/[0.03] shadow-xl hover:bg-white/[0.03] transition-colors">
              <div className="p-3 bg-[#1A2542] rounded-2xl w-fit mb-6 border border-[#3B6BEA]/20">
                <Shield className="text-[#3B6BEA] h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sem Limite de Tamanho</h3>
              <p className="text-[#8B92A5] text-sm leading-relaxed">
                Por não depender de servidores de armazenamento, você não bate em limites de 2GB ou 5GB. Transfira dezenas de gigabytes sem pagar nada.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Open Source Banner */}
        <section className="bg-[#1A1D24] rounded-[2.5rem] p-8 md:p-12 border border-white/[0.03] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 mb-4 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Github className="text-white" size={16} />
              <span className="text-[11px] font-bold text-white tracking-widest uppercase">Open Source</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Software Livre e Transparente</h2>
            <p className="text-[#8B92A5] text-lg mb-8 leading-relaxed">
              Acreditamos na transparência. O Heimdall é um projeto de código aberto, o que significa que qualquer pessoa pode auditar o código para garantir que ele é seguro e livre de rastreadores.
            </p>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-white hover:bg-white/90 text-black font-bold transition-all shadow-lg"
            >
              <Github className="h-5 w-5" /> Ver código no GitHub
            </a>
          </div>
          <div className="relative z-10 shrink-0">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <Github className="w-16 h-16 md:w-24 md:h-24 text-white/20" />
            </div>
          </div>
          
          {/* Subtle background decoration */}
          <Github className="absolute -right-20 -bottom-20 text-white/[0.02] w-96 h-96 pointer-events-none" />
        </section>

        {/* Section 3: Ambarks Studios Branding */}
        <footer className="pt-16 pb-8 flex flex-col items-center justify-center space-y-6 text-center mt-24 border-t border-white/[0.05]">
          <p className="text-[#5C6479] text-[11px] font-bold tracking-widest uppercase">
            Um projeto orgulhosamente desenvolvido por
          </p>
          <a 
            href="https://ambarks.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:scale-105 transition-transform"
          >
            <img 
              src="https://ambarks.com/assets/image/ambarks/withe-logotipo.png" 
              alt="Ambarks Studios" 
              className="h-12 md:h-16 w-auto object-contain opacity-90 drop-shadow-lg" 
            />
          </a>
          <p className="text-[#5C6479] text-xs font-medium">
            &copy; {new Date().getFullYear()} Ambarks Studios&reg;. Todos os direitos reservados.
          </p>
        </footer>

      </div>

      {/* Decorative background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-[#3B6BEA]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}
