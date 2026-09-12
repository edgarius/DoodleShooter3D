import React from 'react';
import { PlayerStats, WeaponInfo, WeaponType } from '../types';
import { Volume2, VolumeX, Music, Pause, RefreshCw, Sparkles, ShieldAlert } from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  currentWeapon: WeaponInfo;
  allWeapons: Record<WeaponType, WeaponInfo>;
  onSelectWeapon: (type: WeaponType) => void;
  onReload: () => void;
  onPause: () => void;
  onUseEraser: () => void;
  isMuted: boolean;
  isMusicMuted: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  bannerMessage: { title: string; subtitle?: string } | null;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  currentWeapon,
  allWeapons,
  onSelectWeapon,
  onReload,
  onPause,
  onUseEraser,
  isMuted,
  isMusicMuted,
  onToggleMute,
  onToggleMusic,
  bannerMessage,
}) => {
  // Render health hearts
  const totalHearts = 5;
  const healthPercent = Math.max(0, Math.min(100, stats.health));
  const fullHearts = Math.ceil((healthPercent / 100) * totalHearts);

  const isLowAmmo = currentWeapon.currentAmmo <= Math.ceil(currentWeapon.maxAmmo * 0.25);
  const isOutOfAmmo = currentWeapon.currentAmmo === 0 && currentWeapon.reserveAmmo === 0;
  const canReload = currentWeapon.currentAmmo < currentWeapon.maxAmmo && currentWeapon.reserveAmmo > 0;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 md:p-6 overflow-hidden">
      {/* Top Bar: Paper Notebook Strip */}
      <div className="flex justify-between items-start w-full">
        {/* Left: Health Hearts & Score */}
        <div className="pointer-events-auto bg-[#fefae0] px-4 py-2 doodle-border paper-shadow flex flex-col gap-1">
          {/* Hearts */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm md:text-base font-bold text-[#8c2d19] mr-1">VIDA:</span>
            {Array.from({ length: totalHearts }).map((_, i) => (
              <span
                key={i}
                className={`text-xl md:text-2xl transition-transform ${
                  i < fullHearts ? 'text-[#ef4444] scale-100' : 'text-[#d1d5db] scale-90 opacity-40'
                }`}
              >
                ❤️
              </span>
            ))}
            <span className="ml-2 font-bold text-sm text-[#374151]">
              {Math.round(stats.health)}/100
            </span>
          </div>

          {/* Score & Kills */}
          <div className="flex items-center gap-4 text-sm md:text-base">
            <div className="flex items-center gap-1">
              <span className="text-[#d97706] font-bold">★ PONTOS:</span>
              <span className="text-xl font-bold tracking-wide text-[#1f2937]">{stats.score}</span>
            </div>
            <div className="text-xs md:text-sm text-[#4b5563]">
              Derrotados: <span className="font-bold text-[#15803d]">{stats.kills}</span>
            </div>
          </div>
        </div>

        {/* Center: Wave Badge, Enemy Count & Combo */}
        <div className="flex flex-col items-center">
          <div className="bg-[#fef08a] px-5 py-1.5 doodle-border paper-shadow flex flex-col items-center">
            <span className="text-lg md:text-2xl font-bold text-[#854d0e] leading-tight">
              ONDA {stats.wave}
            </span>
            <div className="text-[11px] font-bold text-[#713f12] flex items-center gap-2">
              <span>Vivos: <strong className="text-[#dc2626]">{stats.enemiesAlive ?? 0}</strong></span>
              <span>•</span>
              <span>Restam na onda: <strong className="text-[#15803d]">{stats.enemiesRemainingInWave ?? 0}</strong></span>
            </div>
          </div>

          {/* Combo Multiplier popup */}
          {stats.combo > 1 && (
            <div className="mt-1 bg-[#f43f5e] text-white px-3 py-0.5 rounded-full text-xs md:text-sm font-bold animate-bounce paper-shadow-sm">
              COMBO {stats.combo}x! (+{stats.combo * 50}%)
            </div>
          )}
        </div>

        {/* Right: Sound Controls & Pause Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onToggleMusic}
            id="toggle-music-btn"
            title="Música do jogo"
            className={`p-2 rounded-xl doodle-border paper-shadow transition-transform hover:scale-105 active:scale-95 ${
              isMusicMuted ? 'bg-[#f3f4f6] text-[#9ca3af]' : 'bg-[#e0e7ff] text-[#4338ca]'
            }`}
          >
            <Music className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleMute}
            id="toggle-sfx-btn"
            title="Efeitos sonoros"
            className={`p-2 rounded-xl doodle-border paper-shadow transition-transform hover:scale-105 active:scale-95 ${
              isMuted ? 'bg-[#f3f4f6] text-[#9ca3af]' : 'bg-[#dcfce7] text-[#15803d]'
            }`}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onPause}
            id="pause-game-btn"
            title="Pausar"
            className="p-2 rounded-xl doodle-border paper-shadow bg-[#fed7aa] text-[#9a3412] transition-transform hover:scale-105 active:scale-95"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center: Hand-drawn Pencil Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="opacity-80">
          <circle cx="20" cy="20" r="10" stroke="#1e1b4b" strokeWidth="2.2" strokeDasharray="3 3" />
          <path d="M20 4 L20 12" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M20 28 L20 36" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M4 20 L12 20" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M28 20 L36 20" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="20" cy="20" r="2.5" fill="#ef4444" />
        </svg>
      </div>

      {/* Big Animated Banner (Wave start, Boss warning, etc.) */}
      {bannerMessage && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
          <div className="bg-[#fef08a] px-8 py-3 doodle-border paper-shadow-lg text-center animate-doodle max-w-lg">
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#9a3412] tracking-wider">
              {bannerMessage.title}
            </h2>
            {bannerMessage.subtitle && (
              <p className="text-sm md:text-lg font-bold text-[#475569] mt-1">
                {bannerMessage.subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bottom Bar: Weapons Bar & Ammo */}
      <div className="flex flex-col sm:flex-row items-end justify-between w-full gap-2">
        {/* Left Bottom: Magic Eraser Ability Button */}
        <div className="pointer-events-auto">
          <button
            onClick={onUseEraser}
            id="magic-eraser-btn"
            className="flex items-center gap-2 bg-[#fbcfe8] hover:bg-[#f472b6] text-[#831843] px-4 py-2.5 doodle-border paper-shadow transition-all hover:scale-105 active:scale-95 cursor-pointer font-bold text-sm md:text-base"
          >
            <Sparkles className="w-5 h-5 text-[#db2777]" />
            <span>Borracha Mágica (Apagar)</span>
          </button>
        </div>

        {/* Right Bottom: Weapons & Ammo Card */}
        <div className="pointer-events-auto bg-[#fbf9f1] p-3 doodle-border paper-shadow flex flex-col gap-2 min-w-[300px]">
          {/* Active Weapon Ammo Display */}
          <div className="flex items-center justify-between border-b-2 border-dashed border-[#d1d5db] pb-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">
                {currentWeapon.subname || 'Arma em Uso'}
              </div>
              <div className="text-base md:text-lg font-extrabold text-[#1f2937]">
                {currentWeapon.name}
              </div>
            </div>

            {/* Ammo count */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1">
                  <span
                    className={`text-3xl font-black ${
                      isOutOfAmmo
                        ? 'text-red-600 animate-pulse'
                        : isLowAmmo
                        ? 'text-amber-600'
                        : 'text-[#15803d]'
                    }`}
                  >
                    {currentWeapon.currentAmmo}
                  </span>
                  <span className="text-sm font-bold text-[#6b7280]">
                    /{currentWeapon.maxAmmo}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-[#4b5563]">
                  Reserva:{' '}
                  <span className={currentWeapon.reserveAmmo <= 0 ? 'text-red-600 font-black' : 'text-blue-600'}>
                    {currentWeapon.reserveAmmo}
                  </span>
                </div>
              </div>

              <button
                onClick={onReload}
                id="reload-btn"
                disabled={!canReload}
                title="Recarregar (Tecla R)"
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  canReload
                    ? 'bg-[#e0e7ff] hover:bg-[#c7d2fe] text-[#4338ca] hover:rotate-180'
                    : 'bg-[#e5e7eb] text-[#9ca3af] opacity-50 cursor-not-allowed'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Out of ammo badge */}
          {isOutOfAmmo && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center justify-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SEM MUNIÇÃO! Ache caixas de {currentWeapon.name}!</span>
            </div>
          )}

          {/* Weapon Selector Tabs (1: Pistola, 2: Espingarda, 3: Rifle) */}
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.values(allWeapons) as WeaponInfo[]).map((w, index) => {
              const isActive = w.id === currentWeapon.id;
              const hasAmmo = w.currentAmmo > 0 || w.reserveAmmo > 0;
              let icon = '📎';
              if (w.id === 'shotgun') icon = '🖍️';
              if (w.id === 'rifle') icon = '✏️';

              return (
                <button
                  key={w.id}
                  id={`select-weapon-${w.id}`}
                  onClick={() => onSelectWeapon(w.id)}
                  className={`px-2 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer text-center relative ${
                    isActive
                      ? 'bg-[#fef08a] border-2 border-[#854d0e] text-[#854d0e] scale-105 shadow-sm'
                      : hasAmmo
                      ? 'bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#4b5563] border border-[#d1d5db]'
                      : 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]'
                  }`}
                >
                  <div className="text-[10px] text-gray-500">[{index + 1}] {icon}</div>
                  <div className="truncate font-extrabold">{w.name.split(' ')[0]}</div>
                  <div className="text-[10px] font-semibold text-gray-600">
                    {w.currentAmmo}/{w.reserveAmmo}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-[#6b7280] text-center font-medium">
            Atalhos: [1] Pistola • [2] Espingarda • [3] Rifle | [R] Recarregar
          </div>
        </div>
      </div>
    </div>
  );
};
