import React from 'react';
import { RotateCcw, Home, Trophy, Star } from 'lucide-react';
import { PlayerStats } from '../types';

interface GameOverModalProps {
  stats: PlayerStats;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, onRestart, onHome }) => {
  const isNewRecord = stats.score >= stats.highScore && stats.score > 0;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
      <div className="max-w-md w-full bg-[#fdfbf7] p-6 md:p-8 doodle-border paper-shadow-lg relative text-center flex flex-col items-center">
        {/* Red pen teacher grade circle */}
        <div className="absolute -top-6 -right-4 w-20 h-20 rounded-full border-4 border-[#dc2626] text-[#dc2626] flex flex-col items-center justify-center font-extrabold rotate-12 bg-white/95 shadow-md">
          <span className="text-xl">NOTA</span>
          <span className="text-2xl leading-none">
            {stats.score > 1000 ? '10 ★' : stats.score > 500 ? '8.5' : '7.0'}
          </span>
        </div>

        {/* Title */}
        <div className="bg-[#fee2e2] px-6 py-2 doodle-border text-[#991b1b] font-extrabold text-2xl md:text-3xl -rotate-1 mb-4">
          ACABOU O PAPEL!
        </div>

        <p className="text-base text-[#475569] font-bold mb-4">
          Os rabiscos tomaram conta do caderno!
        </p>

        {isNewRecord && (
          <div className="bg-[#fef9c3] px-4 py-2 doodle-border-sm text-[#854d0e] font-bold text-sm mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#eab308]" />
            <span>NOVO RECORDE DE PONTOS! PARABÉNS!</span>
          </div>
        )}

        {/* Stats card */}
        <div className="w-full bg-[#f8fafc] p-4 doodle-border-sm paper-shadow-sm mb-6 flex flex-col gap-2.5 text-left text-sm md:text-base">
          <div className="flex justify-between items-center border-b border-dashed border-[#e2e8f0] pb-1.5">
            <span className="text-[#64748b] font-bold">Pontuação Final:</span>
            <span className="text-xl font-extrabold text-[#1e1b4b]">{stats.score}</span>
          </div>
          <div className="flex justify-between items-center border-b border-dashed border-[#e2e8f0] pb-1.5">
            <span className="text-[#64748b] font-bold">Onda Alcançada:</span>
            <span className="text-lg font-bold text-[#d97706]">Onda {stats.wave}</span>
          </div>
          <div className="flex justify-between items-center border-b border-dashed border-[#e2e8f0] pb-1.5">
            <span className="text-[#64748b] font-bold">Rabiscos Vencidos:</span>
            <span className="text-lg font-bold text-[#15803d]">{stats.kills}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#64748b] font-bold">Melhor Recorde:</span>
            <span className="text-lg font-bold text-[#4338ca]">{stats.highScore}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={onRestart}
            id="gameover-restart-btn"
            className="flex-1 py-3 px-5 bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold text-lg doodle-border paper-shadow flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>TENTAR DE NOVO</span>
          </button>
          <button
            onClick={onHome}
            id="gameover-home-btn"
            className="py-3 px-5 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#374151] font-bold text-lg doodle-border paper-shadow flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <Home className="w-5 h-5" />
            <span>MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
