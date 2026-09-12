export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'victory';

export type WeaponType = 'pistol' | 'shotgun' | 'rifle';

export interface WeaponInfo {
  id: WeaponType;
  name: string;
  subname: string;
  damage: number;
  fireRateMs: number;
  maxAmmo: number; // Clip size
  currentAmmo: number; // In current clip
  reserveAmmo: number; // Stored ammo
  maxReserveAmmo: number; // Max stored ammo
  reloadTimeMs: number;
  bulletSpeed: number;
  spread: number;
  pellets: number;
  color: string;
  projectileType: 'clip' | 'crayon' | 'pencil';
  description: string;
}

export type EnemyType = 'zoio' | 'robo' | 'dino' | 'atirador' | 'boss';

export interface EnemyStats {
  type: EnemyType;
  name: string;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  scoreValue: number;
  size: number;
  color: string;
  role: 'rusher' | 'tank' | 'ranged' | 'jumper' | 'boss';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  z: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  score: number;
  highScore: number;
  wave: number;
  kills: number;
  combo: number;
  comboTimer: number;
  enemiesRemainingInWave: number;
  enemiesAlive: number;
}
