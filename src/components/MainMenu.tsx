import React from 'react';
import { Play, Volume2, VolumeX, Music, Trophy, Crosshair } from 'lucide-react';

interface MainMenuProps {
  onStartGame: () => void;
  highScore: number;
  isMuted: boolean;
  isMusicMuted: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  highScore,
  isMuted,
  isMusicMuted,
  onToggleMute,
  onToggleMusic,
}) => {
  return (
    <div className="absolute inset-0 bg-[#f7f5ed] flex items-center justify-center p-4 overflow-y-auto z-30">
      {/* Notebook Binder Cover */}
      <div className="max-w-2xl w-full bg-[#fdfbf7] p-6 md:p-8 doodle-border paper-shadow-lg relative flex flex-col items-center my-auto">
        {/* Spiral Binder Rings on Left */}
        <div className="absolute -left-3.5 top-8 bottom-8 flex flex-col justify-between pointer-events-none">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="w-7 h-3 rounded-full bg-[#4b5563] border-2 border-[#1f2937] shadow-xs"
            />
          ))}
        </div>

        {/* Notebook Top Title Tag */}
        <div className="bg-[#fef08a] px-6 py-2 doodle-border paper-shadow -rotate-2 mb-3">
          <span className="text-xs md:text-sm font-bold text-[#854d0e] uppercase tracking-widest">
            CADERNO ESCOLAR 3D • GUERRA DE RABISCOS
          </span>
        </div>

        {/* Main Drawn Logo */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-[#1e1b4b] text-center tracking-wide leading-tight">
          DOODLE SHOOTER <span className="text-[#ef4444] inline-block rotate-3">3D</span>
        </h1>
        <p className="text-base md:text-lg font-bold text-[#b45309] text-center mt-1">
          Batalha nos Prédios e Casas de Papelão!
        </p>

        {/* High Score Badge */}
        {highScore > 0 && (
          <div className="mt-2 flex items-center gap-2 bg-[#fef9c3] px-4 py-1.5 doodle-border-sm paper-shadow-sm text-[#854d0e] font-bold text-xs md:text-sm">
            <Trophy className="w-4 h-4 text-[#eab308]" />
            <span>RECORDE DA TURMA: {highScore} PONTOS</span>
          </div>
        )}

        {/* Child Doodles Preview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full my-4">
          <div className="bg-[#f0fdf4] p-2 doodle-border-sm paper-shadow-sm text-center">
            <div className="text-2xl mb-0.5">🟢👁️</div>
            <div className="font-bold text-[11px] text-[#15803d]">Zóio Saltador</div>
            <div className="text-[9px] text-[#4b5563]">Pulos no ar</div>
          </div>
          <div className="bg-[#fefce8] p-2 doodle-border-sm paper-shadow-sm text-center">
            <div className="text-2xl mb-0.5">🤖📦</div>
            <div className="font-bold text-[11px] text-[#ca8a04]">Robô de Caixa</div>
            <div className="text-[9px] text-[#4b5563]">Tanque corpo a corpo</div>
          </div>
          <div className="bg-[#faf5ff] p-2 doodle-border-sm paper-shadow-sm text-center">
            <div className="text-2xl mb-0.5">🦖🟣</div>
            <div className="font-bold text-[11px] text-[#7e22ce]">Dino Veloz</div>
            <div className="text-[9px] text-[#4b5563]">Corre em zigue-zague</div>
          </div>
          <div className="bg-[#eff6ff] p-2 doodle-border-sm paper-shadow-sm text-center">
            <div className="text-2xl mb-0.5">🛩️🖋️</div>
            <div className="font-bold text-[11px] text-[#1d4ed8]">Atirador Origami</div>
            <div className="text-[9px] text-[#4b5563]">Atira nanquim de longe!</div>
          </div>
          <div className="bg-[#fef2f2] p-2 doodle-border-sm paper-shadow-sm text-center col-span-2 sm:col-span-1">
            <div className="text-2xl mb-0.5">👑👹</div>
            <div className="font-bold text-[11px] text-[#b91c1c]">Chefe Rabisco</div>
            <div className="text-[9px] text-[#4b5563]">Onda 5 (Chefão)</div>
          </div>
        </div>

        {/* Weapons Arsenal Showcase */}
        <div className="w-full bg-[#fffbeb] p-3 doodle-border-sm paper-shadow-sm mb-4">
          <div className="text-xs font-bold text-[#b45309] text-center uppercase tracking-wider mb-2">
            ARSENAL DE MATERIAIS ESCOLARES (COLETE MUNIÇÃO NO CHÃO!)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-white/80 p-2 rounded border border-[#fde68a]">
              <span className="font-bold text-[#0284c7]">[1] 📎 Pistola de Pregador</span>
              <p className="text-[10px] text-gray-600 mt-0.5">Tiros rápidos e precisos de clips. Pente de 12.</p>
            </div>
            <div className="bg-white/80 p-2 rounded border border-[#fde68a]">
              <span className="font-bold text-[#dc2626]">[2] 🖍️ Espingarda de Giz</span>
              <p className="text-[10px] text-gray-600 mt-0.5">Dispara leque devastador de 7 fragmentos coloridos.</p>
            </div>
            <div className="bg-white/80 p-2 rounded border border-[#fde68a]">
              <span className="font-bold text-[#ca8a04]">[3] ✏️ Rifle de Lápis HB</span>
              <p className="text-[10px] text-gray-600 mt-0.5">Rajada automática contínua de 30 balas de grafite.</p>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="w-full bg-[#f8fafc] p-3 doodle-border-sm paper-shadow-sm mb-5 text-sm text-[#334155]">
          <div className="font-bold text-[#0f172a] text-center mb-1 text-sm flex items-center justify-center gap-1.5">
            <Crosshair className="w-4 h-4 text-[#ef4444]" />
            <span>COMO JOGAR</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
            <div>• <strong className="text-[#0284c7]">W, A, S, D</strong>: Andar pelo cenário</div>
            <div>• <strong className="text-[#0284c7]">Mouse</strong>: Olhar e Mirar</div>
            <div>• <strong className="text-[#ef4444]">Clique Esquerdo</strong>: Atirar</div>
            <div>• <strong className="text-[#16a34a]">Espaço</strong>: Pular</div>
            <div>• <strong className="text-[#ca8a04]">Teclas 1, 2, 3</strong>: Trocar de arma</div>
            <div>• <strong className="text-[#9333ea]">Tecla R</strong>: Recarregar munição</div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-dashed border-[#cbd5e1] text-center text-[11px] text-[#64748b]">
            Dica: Use as casas e prédios como abrigo contra os tiros de nanquim e colete caixas de munição caídas!
          </div>
        </div>

        {/* Big Start Button */}
        <button
          onClick={onStartGame}
          id="start-game-btn"
          className="w-full sm:w-auto px-10 py-3.5 bg-[#ef4444] hover:bg-[#dc2626] text-white text-2xl font-extrabold doodle-border paper-shadow-lg flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Play className="w-7 h-7 fill-current" />
          <span>JOGAR AGORA!</span>
        </button>

        {/* Audio Controls Footer */}
        <div className="flex items-center gap-4 mt-5 text-xs md:text-sm">
          <button
            onClick={onToggleMusic}
            id="menu-music-btn"
            className="flex items-center gap-1.5 text-[#4338ca] hover:underline cursor-pointer font-bold"
          >
            <Music className="w-4 h-4" />
            <span>Música: {isMusicMuted ? 'Desligada' : 'Ligada'}</span>
          </button>
          <span className="text-[#cbd5e1]">•</span>
          <button
            onClick={onToggleMute}
            id="menu-sfx-btn"
            className="flex items-center gap-1.5 text-[#15803d] hover:underline cursor-pointer font-bold"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>Efeitos: {isMuted ? 'Mudo' : 'Ativos'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
