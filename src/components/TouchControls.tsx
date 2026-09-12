import React, { useRef, useState, useEffect } from 'react';
import { Crosshair, ArrowUp, RefreshCw } from 'lucide-react';

interface TouchControlsProps {
  onMove: (x: number, z: number) => void;
  onLook: (dx: number, dy: number) => void;
  onShoot: (active: boolean) => void;
  onJump: () => void;
  onReload: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onLook,
  onShoot,
  onJump,
  onReload,
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  // Joystick touch events
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    setIsJoystickActive(true);
    updateJoystick(e.touches[0]);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    if (!isJoystickActive) return;
    updateJoystick(e.touches[0]);
  };

  const handleJoystickTouchEnd = () => {
    setIsJoystickActive(false);
    setStickPos({ x: 0, y: 0 });
    onMove(0, 0);
  };

  const updateJoystick = (touch: React.Touch) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = rect.width / 2;
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setStickPos({ x: dx, y: dy });
    // Normalize -1 to 1
    onMove(dx / maxRadius, dy / maxRadius);
  };

  // Look touch events
  const handleLookTouchStart = (e: React.TouchEvent) => {
    lastTouchRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleLookTouchMove = (e: React.TouchEvent) => {
    if (!lastTouchRef.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;

    const dx = currentX - lastTouchRef.current.x;
    const dy = currentY - lastTouchRef.current.y;

    onLook(dx, dy);

    lastTouchRef.current = { x: currentX, y: currentY };
  };

  const handleLookTouchEnd = () => {
    lastTouchRef.current = null;
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 md:hidden">
      {/* Right side look area (half screen) */}
      <div
        className="absolute top-0 right-0 w-1/2 h-2/3 pointer-events-auto"
        onTouchStart={handleLookTouchStart}
        onTouchMove={handleLookTouchMove}
        onTouchEnd={handleLookTouchEnd}
      />

      {/* Left: Virtual Joystick */}
      <div className="absolute bottom-8 left-6 pointer-events-auto">
        <div
          ref={joystickRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          className="w-32 h-32 rounded-full bg-white/40 border-4 border-dashed border-[#2d2a26]/60 flex items-center justify-center relative backdrop-blur-xs"
        >
          <div
            className="w-14 h-14 rounded-full bg-[#f59e0b] border-2 border-[#2d2a26] shadow-md flex items-center justify-center transition-transform"
            style={{
              transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
            }}
          >
            <span className="text-xs font-bold text-white">ANDAR</span>
          </div>
        </div>
      </div>

      {/* Right: Action Buttons (Shoot, Jump, Reload) */}
      <div className="absolute bottom-8 right-6 pointer-events-auto flex items-end gap-3">
        {/* Jump Button */}
        <button
          onClick={onJump}
          id="touch-jump-btn"
          className="w-14 h-14 rounded-full bg-[#38bdf8] active:bg-[#0284c7] border-2 border-[#1e1b4b] shadow-md flex flex-col items-center justify-center text-white font-bold"
        >
          <ArrowUp className="w-5 h-5" />
          <span className="text-[10px]">PULO</span>
        </button>

        {/* Reload Button */}
        <button
          onClick={onReload}
          id="touch-reload-btn"
          className="w-14 h-14 rounded-full bg-[#a855f7] active:bg-[#7e22ce] border-2 border-[#1e1b4b] shadow-md flex flex-col items-center justify-center text-white font-bold"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-[10px]">RECARGA</span>
        </button>

        {/* Big Shoot Button */}
        <button
          onTouchStart={() => onShoot(true)}
          onTouchEnd={() => onShoot(false)}
          onMouseDown={() => onShoot(true)}
          onMouseUp={() => onShoot(false)}
          id="touch-shoot-btn"
          className="w-20 h-20 rounded-full bg-[#ef4444] active:bg-[#b91c1c] border-4 border-[#1e1b4b] shadow-lg flex flex-col items-center justify-center text-white font-extrabold text-base transition-transform active:scale-90"
        >
          <Crosshair className="w-6 h-6" />
          <span>FOGO!</span>
        </button>
      </div>
    </div>
  );
};
