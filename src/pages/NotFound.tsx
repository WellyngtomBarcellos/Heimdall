import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Ghost, MapPinOff } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E1015] text-white font-sans p-6 selection:bg-[#3B6BEA]/30">
      <div className="bg-[#1A1D24] rounded-[2.5rem] p-10 md:p-16 max-w-2xl w-full relative overflow-hidden text-center shadow-2xl shadow-black/50 border border-white/[0.03]">
        
        {/* Pill/Badge style from the design */}
        <div className="inline-flex items-center gap-2 mb-8 bg-[#1A2542] px-4 py-2 rounded-full border border-[#3B6BEA]/20">
          <MapPinOff className="text-[#3B6BEA]" size={16} />
          <span className="text-[11px] font-bold text-[#3B6BEA] tracking-widest uppercase">Rota Desconhecida</span>
        </div>

        {/* Big typography and gradients */}
        <h1 className="text-[7rem] md:text-[9rem] leading-none font-bold mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-[#5C6479]">
          404
        </h1>
        
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Página não encontrada</h2>
        
        {/* Muted text style from the design */}
        <p className="text-[#8B92A5] text-lg font-medium mb-12 max-w-md mx-auto">
          Ops! O caminho <span className="text-white/80 font-mono text-sm px-2 py-1 bg-black/20 rounded-lg">{location.pathname}</span> parece não existir. Talvez a página tenha sido movida ou deletada.
        </p>
        
        {/* Buttons applying the rounded-2xl style and blue accent */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors w-full sm:w-auto border border-white/[0.05]"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <Link 
            to="/" 
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#3B6BEA] hover:bg-[#3B6BEA]/90 text-white font-medium shadow-lg shadow-[#3B6BEA]/25 transition-all w-full sm:w-auto"
          >
            <Home size={20} />
            Página Inicial
          </Link>
        </div>

        {/* Decorative background icon mimicking the card style */}
        <Ghost className="absolute -left-12 -bottom-16 text-white/[0.015] w-[30rem] h-[30rem] pointer-events-none -rotate-12" />
      </div>
    </div>
  );
};

export default NotFound;
