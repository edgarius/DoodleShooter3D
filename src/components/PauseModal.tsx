import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Music } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  isMuted: boolean;
  isMusicMuted: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  isMuted,
  isMusicMuted,
  onToggleMute,
  onToggleMusic,
}) => {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-40">
      <div className="max-w-sm w-full bg-[#fdfbf7] p-6 doodle-border paper-shadow-lg text-center flex flex-col items-center">
        <div className="bg-[#fef08a] px-6 py-1.5 doodle-border text-[#854d0e] font-extrabold text-2xl mb-5">
          JOGO PAUSADO
        </div>

        <div className="flex flex-col gap-3 w-full mb-5">
          <button
            onClick={onResume}
            id="pause-resume-btn"
            className="py-3 px-4 bg-[#ef4444] hover:bg-[#dc2626] text-white font-extrabold text-lg doodle-border paper-shadow flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>CONTINUAR</span>
          </button>

          <button
            onClick={onRestart}
            id="pause-restart-btn"
            className="py-2.5 px-4 bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-base doodle-border paper-shadow flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINICIAR PARTIDA</span>
          </button>

          <button
            onClick={onHome}
            id="pause-home-btn"
            className="py-2.5 px-4 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#374151] font-bold text-base doodle-border paper-shadow flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>MENU PRINCIPAL</span>
          </button>
        </div>

        {/* Audio toggles inside pause */}
        <div className="flex items-center gap-3 border-t border-dashed border-[#d1d5db] pt-4 w-full justify-center text-sm">
          <button
            onClick={onToggleMusic}
            id="pause-toggle-music-btn"
            className="p-2 rounded-lg bg-[#e0e7ff] text-[#4338ca] hover:bg-[#c7d2fe] flex items-center gap-1 font-bold text-xs cursor-pointer"
          >
            <Music className="w-4 h-4" />
            <span>{isMusicMuted ? 'Música: Off' : 'Música: On'}</span>
          </button>

          <button
            onClick={onToggleMute}
            id="pause-toggle-sfx-btn"
            className="p-2 rounded-lg bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0] flex items-center gap-1 font-bold text-xs cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? 'SFX: Mudo' : 'SFX: On'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
