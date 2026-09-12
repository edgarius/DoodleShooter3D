import React, { useEffect, useRef, useState } from 'react';
import { ShooterEngine } from './game/ShooterEngine';
import { GameState, PlayerStats, WeaponInfo, WeaponType } from './types';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { sounds } from './game/soundEffects';

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ShooterEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('menu');
  const [stats, setStats] = useState<PlayerStats>({
    health: 100,
    maxHealth: 100,
    score: 0,
    highScore: 0,
    wave: 1,
    kills: 0,
    combo: 0,
    comboTimer: 0,
  });

  const [currentWeapon, setCurrentWeapon] = useState<WeaponInfo | null>(null);
  const [allWeapons, setAllWeapons] = useState<Record<WeaponType, WeaponInfo> | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ title: string; subtitle?: string } | null>(null);

  // Sound states
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [pointerLockNotice, setPointerLockNotice] = useState(true);

  // Initialize game engine
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const engine = new ShooterEngine(canvasContainerRef.current);
    engineRef.current = engine;

    engine.onStatsChange = (newStats) => {
      setStats({ ...newStats });
    };

    engine.onWeaponChange = (newWeapon) => {
      setCurrentWeapon({ ...newWeapon });
      setAllWeapons({ ...engine.weapons });
    };

    engine.onGameStateChange = (newState) => {
      setGameState(newState);
    };

    engine.onBannerMessage = (title, subtitle) => {
      setBannerMessage({ title, subtitle });
      setTimeout(() => {
        setBannerMessage(null);
      }, 2500);
    };

    setCurrentWeapon({ ...engine.weapons[engine.currentWeaponType] });
    setAllWeapons({ ...engine.weapons });

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleStartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.startGame();
    setGameState('playing');
  };

  const handleSelectWeapon = (type: WeaponType) => {
    engineRef.current?.switchWeapon(type);
  };

  const handleReload = () => {
    engineRef.current?.reload();
  };

  const handlePause = () => {
    engineRef.current?.togglePause();
  };

  const handleResume = () => {
    engineRef.current?.togglePause();
  };

  const handleRestart = () => {
    engineRef.current?.startGame();
  };

  const handleHome = () => {
    if (engineRef.current) {
      engineRef.current.stopLoop();
      engineRef.current.gameState = 'menu';
    }
    setGameState('menu');
  };

  const handleUseEraser = () => {
    engineRef.current?.triggerMagicEraser();
  };

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleMusic = () => {
    const muted = sounds.toggleMusic();
    setIsMusicMuted(muted);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#f7f5ed] font-['Patrick_Hand',cursive]">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={canvasContainerRef}
        id="game-canvas-container"
        className="w-full h-full cursor-crosshair"
      />

      {/* Main Menu Screen */}
      {gameState === 'menu' && (
        <MainMenu
          onStartGame={handleStartGame}
          highScore={stats.highScore}
          isMuted={isMuted}
          isMusicMuted={isMusicMuted}
          onToggleMute={handleToggleMute}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* In-Game HUD */}
      {(gameState === 'playing' || gameState === 'paused') && currentWeapon && allWeapons && (
        <HUD
          stats={stats}
          currentWeapon={currentWeapon}
          allWeapons={allWeapons}
          onSelectWeapon={handleSelectWeapon}
          onReload={handleReload}
          onPause={handlePause}
          onUseEraser={handleUseEraser}
          isMuted={isMuted}
          isMusicMuted={isMusicMuted}
          onToggleMute={handleToggleMute}
          onToggleMusic={handleToggleMusic}
          bannerMessage={bannerMessage}
        />
      )}

      {/* Pointer Lock Hint for Desktop */}
      {gameState === 'playing' && pointerLockNotice && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none hidden md:block">
          <div className="bg-[#fef9c3]/90 text-[#854d0e] px-4 py-1.5 doodle-border-sm text-xs md:text-sm font-bold shadow-xs">
            Dica: Clique na tela para travar o mouse e mirar. Pressione ESC para soltar o cursor.
          </div>
        </div>
      )}

      {/* Mobile Touch Controls Overlay */}
      {gameState === 'playing' && engineRef.current && (
        <TouchControls
          onMove={(x, z) => engineRef.current?.handleTouchMove(x, z)}
          onLook={(dx, dy) => engineRef.current?.handleTouchLook(dx, dy)}
          onShoot={(active) => engineRef.current?.handleTouchShoot(active)}
          onJump={() => engineRef.current?.handleTouchJump()}
          onReload={handleReload}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleHome}
          isMuted={isMuted}
          isMusicMuted={isMusicMuted}
          onToggleMute={handleToggleMute}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <GameOverModal
          stats={stats}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}
    </main>
  );
}
