import * as THREE from 'three';
import { EnemyType } from '../types';

// Utility to create a canvas-based THREE.CanvasTexture
function createTextureFromCanvas(
  drawFn: (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => void,
  width = 512,
  height = 512,
  frame = 0
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  drawFn(ctx, width, height, frame);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  return texture;
}

// Generate an authentic lined school notebook paper texture with doodles
export function createNotebookPaperTexture(repeat = 8): THREE.CanvasTexture {
  const width = 1024;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Warm paper background with slight paper grain
  ctx.fillStyle = '#fbf9f1';
  ctx.fillRect(0, 0, width, height);

  // Subtle paper noise / fibers
  ctx.fillStyle = 'rgba(180, 160, 130, 0.04)';
  for (let i = 0; i < 4000; i++) {
    const px = Math.random() * width;
    const py = Math.random() * height;
    ctx.fillRect(px, py, 1.5, 1.5);
  }

  // Horizontal blue notebook ruled lines
  const lineSpacing = 32;
  ctx.strokeStyle = '#a4c2e6';
  ctx.lineWidth = 1.6;
  for (let y = lineSpacing; y < height; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    // Slight hand jitter
    for (let x = 0; x < width; x += 64) {
      ctx.lineTo(x + 32, y + (Math.sin(x * 0.05) * 0.6));
    }
    ctx.stroke();
  }

  // Vertical red pencil margin line
  ctx.strokeStyle = '#e07a7a';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(110, 0);
  for (let y = 0; y < height; y += 64) {
    ctx.lineTo(110 + (Math.cos(y * 0.05) * 0.8), y + 32);
  }
  ctx.stroke();

  // Spiral notebook binder punch holes along left
  ctx.fillStyle = '#eae5d7';
  ctx.strokeStyle = '#7c7365';
  ctx.lineWidth = 1.5;
  for (let y = 20; y < height; y += 64) {
    ctx.beginPath();
    ctx.arc(38, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Kid margin doodles: Tic-Tac-Toe, Smiling Sun, Little Stars, Stick figures
  drawDoodleTicTacToe(ctx, 160, 200);
  drawDoodleLittleStar(ctx, 420, 150, '#e5a528');
  drawDoodleLittleStar(ctx, 800, 320, '#d9534f');
  drawDoodleFlower(ctx, 700, 750);
  drawDoodleStickFigure(ctx, 280, 680);
  drawDoodleHeart(ctx, 550, 480);
  drawDoodleSpiral(ctx, 880, 120);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  return texture;
}

// Math grid notebook paper texture (quadriculado)
export function createGridPaperTexture(repeat = 4): THREE.CanvasTexture {
  const width = 512;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8f6ed';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#b8d0eb';
  ctx.lineWidth = 1.2;
  const grid = 28;
  for (let x = 0; x <= width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Doodles on math paper
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.font = '22px "Patrick Hand", cursive';
  ctx.fillStyle = '#333';
  ctx.fillText('1 + 1 = 100?!', 40, 80);
  ctx.fillText('10 x 10 = 100', 320, 240);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  return texture;
}

// Cardboard box texture with tape and child drawings
export function createCardboardTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Cardboard brown base
  ctx.fillStyle = '#dcb68a';
  ctx.fillRect(0, 0, width, height);

  // Cardboard texture lines
  ctx.strokeStyle = 'rgba(170, 130, 90, 0.25)';
  ctx.lineWidth = 2;
  for (let y = 0; y < height; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Scotch tape strips
  ctx.fillStyle = 'rgba(255, 255, 230, 0.45)';
  ctx.strokeStyle = 'rgba(210, 200, 170, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.fillRect(40, 230, 432, 55);
  ctx.strokeRect(40, 230, 432, 55);

  // Handwritten child text: "FORTE DO CLUBE" & doodle arrows
  ctx.save();
  ctx.font = 'bold 36px "Patrick Hand", cursive';
  ctx.fillStyle = '#222';
  ctx.fillText('★ FORTE SECRETO ★', 90, 160);
  ctx.font = '24px "Patrick Hand", cursive';
  ctx.fillStyle = '#bf3b3b';
  ctx.fillText('PROIBIDO MONSTROS!', 120, 350);

  // Little skull doodle or arrow
  drawDoodleSkull(ctx, 360, 340);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Helper doodles
function drawDoodleTicTacToe(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  // 4 grid lines
  ctx.beginPath();
  ctx.moveTo(x + 20, y); ctx.lineTo(x + 20, y + 60);
  ctx.moveTo(x + 40, y); ctx.lineTo(x + 40, y + 60);
  ctx.moveTo(x, y + 20); ctx.lineTo(x + 60, y + 20);
  ctx.moveTo(x, y + 40); ctx.lineTo(x + 60, y + 40);
  ctx.stroke();

  // X and O
  ctx.strokeStyle = '#387ad6';
  ctx.beginPath();
  ctx.moveTo(x + 5, y + 5); ctx.lineTo(x + 15, y + 15);
  ctx.moveTo(x + 15, y + 5); ctx.lineTo(x + 5, y + 15);
  ctx.stroke();

  ctx.strokeStyle = '#df4444';
  ctx.beginPath();
  ctx.arc(x + 30, y + 30, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawDoodleLittleStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  // Classic 5-point star drawn in one continuous stroke like a child
  const r = 24;
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color + '44';
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawDoodleFlower(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = '#3b823b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x - 10, y - 25, x, y - 50);
  ctx.stroke();

  // Yellow center
  ctx.fillStyle = '#f5c518';
  ctx.beginPath();
  ctx.arc(x, y - 50, 10, 0, Math.PI * 2);
  ctx.fill();

  // Red petals
  ctx.strokeStyle = '#e04242';
  ctx.fillStyle = '#fca5a5';
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * 16, y - 50 + Math.sin(a) * 16, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawDoodleStickFigure(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  // Head
  ctx.beginPath();
  ctx.arc(x, y - 45, 12, 0, Math.PI * 2);
  ctx.stroke();
  // Smile & Eyes
  ctx.beginPath();
  ctx.arc(x - 4, y - 47, 1.5, 0, Math.PI * 2);
  ctx.arc(x + 4, y - 47, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y - 44, 5, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - 33);
  ctx.lineTo(x, y - 12);
  // Arms
  ctx.moveTo(x - 18, y - 24);
  ctx.lineTo(x + 18, y - 24);
  // Legs
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x - 14, y);
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x + 14, y);
  ctx.stroke();
  ctx.restore();
}

function drawDoodleHeart(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = '#e11d48';
  ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y + 10);
  ctx.bezierCurveTo(x - 15, y - 15, x - 25, y + 5, x, y + 25);
  ctx.bezierCurveTo(x + 25, y + 5, x + 15, y - 15, x, y + 10);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawDoodleSpiral(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 40; i++) {
    const angle = 0.25 * i;
    const r = (1 + angle) * 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawDoodleSkull(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - 5, y - 2, 2.5, 0, Math.PI * 2);
  ctx.arc(x + 5, y - 2, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Teeth
  ctx.beginPath();
  ctx.moveTo(x - 6, y + 14); ctx.lineTo(x - 6, y + 20);
  ctx.moveTo(x, y + 14); ctx.lineTo(x, y + 20);
  ctx.moveTo(x + 6, y + 14); ctx.lineTo(x + 6, y + 20);
  ctx.stroke();
  ctx.restore();
}

// Generate animated enemy billboard textures with 2 "boiling line" frames!
export function createEnemyTextures(type: EnemyType): THREE.CanvasTexture[] {
  const frames: THREE.CanvasTexture[] = [];
  for (let f = 0; f < 2; f++) {
    const tex = createTextureFromCanvas((ctx, w, h, frame) => {
      ctx.clearRect(0, 0, w, h);
      if (type === 'zoio') {
        drawMonsterZoio(ctx, w / 2, h / 2 + 20, frame);
      } else if (type === 'robo') {
        drawMonsterRobo(ctx, w / 2, h / 2 + 10, frame);
      } else if (type === 'dino') {
        drawMonsterDino(ctx, w / 2, h / 2 + 10, frame);
      } else if (type === 'atirador') {
        drawMonsterAtirador(ctx, w / 2, h / 2 + 10, frame);
      } else if (type === 'boss') {
        drawMonsterBoss(ctx, w / 2, h / 2 + 10, frame);
      }
    }, 256, 256, f);
    frames.push(tex);
  }
  return frames;
}

// 1. Monstrinho Zóio: One-eyed green crayon blob with crayon scribble fill
function drawMonsterZoio(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number) {
  const jitter = frame * 2;
  ctx.save();

  // Green crayon fill with scribbly strokes
  ctx.fillStyle = '#4ade80';
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(cx - 50 + jitter, cy + 40);
  ctx.quadraticCurveTo(cx - 70 - jitter, cy - 20, cx - 30 + jitter, cy - 60);
  ctx.quadraticCurveTo(cx + jitter, cy - 80 - jitter, cx + 40 - jitter, cy - 50);
  ctx.quadraticCurveTo(cx + 70 + jitter, cy - 10, cx + 55 - jitter, cy + 40);
  ctx.quadraticCurveTo(cx, cy + 50 + jitter, cx - 50 + jitter, cy + 40);
  ctx.closePath();
  ctx.fill();

  // Crayon scribble lines inside body
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;
  for (let y = cy - 40; y <= cy + 30; y += 14) {
    ctx.beginPath();
    ctx.moveTo(cx - 35 + ((y % 3) * 4), y + (frame ? 2 : -2));
    ctx.lineTo(cx + 35 - ((y % 3) * 4), y + (frame ? -2 : 2));
    ctx.stroke();
  }

  // Body outline in thick black crayon
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(cx - 50 + jitter, cy + 40);
  ctx.quadraticCurveTo(cx - 70 - jitter, cy - 20, cx - 30 + jitter, cy - 60);
  ctx.quadraticCurveTo(cx + jitter, cy - 80 - jitter, cx + 40 - jitter, cy - 50);
  ctx.quadraticCurveTo(cx + 70 + jitter, cy - 10, cx + 55 - jitter, cy + 40);
  ctx.quadraticCurveTo(cx, cy + 50 + jitter, cx - 50 + jitter, cy + 40);
  ctx.stroke();

  // Big Googly Eye in center
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy - 15, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pupil looking menacingly
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx + (frame ? 3 : -3), cy - 15, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx + 3, cy - 18, 3, 0, Math.PI * 2);
  ctx.fill();

  // Sharp pencil teeth smile
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy + 18);
  ctx.quadraticCurveTo(cx, cy + 32, cx + 30, cy + 18);
  ctx.stroke();

  // Pointy teeth
  ctx.fillStyle = '#fff';
  for (let x = cx - 20; x <= cx + 20; x += 10) {
    ctx.beginPath();
    ctx.moveTo(x, cy + 20);
    ctx.lineTo(x + 5, cy + 28 + (frame ? 2 : 0));
    ctx.lineTo(x + 10, cy + 20);
    ctx.fill();
    ctx.stroke();
  }

  // Stick legs
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 25, cy + 45);
  ctx.lineTo(cx - 28 + (frame ? -4 : 4), cy + 68);
  ctx.moveTo(cx + 25, cy + 45);
  ctx.lineTo(cx + 28 + (frame ? 4 : -4), cy + 68);
  ctx.stroke();

  ctx.restore();
}

// 2. Robô de Papelão: Cardboard box robot with spring antenna and buttons
function drawMonsterRobo(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number) {
  const j = frame * 2;
  ctx.save();

  // Cardboard head & body
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 4.5;
  ctx.lineJoin = 'round';

  // Body box
  ctx.fillRect(cx - 45 + j, cy - 25, 90, 80);
  ctx.strokeRect(cx - 45 + j, cy - 25, 90, 80);

  // Head box
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(cx - 35 - j, cy - 75, 70, 48);
  ctx.strokeRect(cx - 35 - j, cy - 75, 70, 48);

  // Antenna with spring spiral
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 75);
  ctx.lineTo(cx + (frame ? 4 : -4), cy - 90);
  ctx.lineTo(cx + (frame ? -4 : 4), cy - 100);
  ctx.lineTo(cx, cy - 110);
  ctx.stroke();
  // Red light on antenna
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(cx, cy - 114, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Robot eyes (two square glass meters)
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(cx - 24 - j, cy - 65, 18, 14);
  ctx.strokeRect(cx - 24 - j, cy - 65, 18, 14);
  ctx.fillRect(cx + 6 - j, cy - 65, 18, 14);
  ctx.strokeRect(cx + 6 - j, cy - 65, 18, 14);

  // Robot mouth (bar code or grill)
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2.5;
  for (let x = cx - 18; x <= cx + 18; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x - j, cy - 42);
    ctx.lineTo(x - j, cy - 34);
    ctx.stroke();
  }

  // Chest buttons & meter
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(cx - 22 + j, cy, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#10b981';
  ctx.beginPath(); ctx.arc(cx + j, cy, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#6366f1';
  ctx.beginPath(); ctx.arc(cx + 22 + j, cy, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Cardboard tape on corner
  ctx.fillStyle = 'rgba(255, 255, 220, 0.7)';
  ctx.fillRect(cx + 20, cy + 30, 24, 18);

  // Spring arms
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 45 + j, cy);
  ctx.lineTo(cx - 65, cy + (frame ? 10 : -10));
  ctx.lineTo(cx - 75, cy + 20);
  ctx.moveTo(cx + 45 + j, cy);
  ctx.lineTo(cx + 65, cy + (frame ? -10 : 10));
  ctx.lineTo(cx + 75, cy + 20);
  ctx.stroke();

  // Treads / wheels
  ctx.fillStyle = '#475569';
  ctx.fillRect(cx - 40, cy + 55, 80, 22);
  ctx.strokeRect(cx - 40, cy + 55, 80, 22);

  ctx.restore();
}

// 3. Dino Rabisco: Purple crayon T-Rex with tiny arms and jagged spikes
function drawMonsterDino(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number) {
  const j = frame * 3;
  ctx.save();

  // Purple crayon body
  ctx.fillStyle = '#a855f7';
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 4.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  // Tail
  ctx.moveTo(cx - 80 + j, cy + 30);
  ctx.quadraticCurveTo(cx - 50, cy + 10, cx - 20, cy - 20);
  // Neck and big chomper head
  ctx.lineTo(cx, cy - 60);
  ctx.lineTo(cx + 55 + j, cy - 60); // Snout
  ctx.lineTo(cx + 55 + j, cy - 35); // Mouth
  ctx.lineTo(cx + 15, cy - 30);     // Open jaw
  ctx.lineTo(cx + 45 + j, cy - 10); // Lower jaw
  ctx.lineTo(cx + 20, cy + 10);     // Chin to throat
  ctx.lineTo(cx + 30, cy + 45);     // Belly
  ctx.quadraticCurveTo(cx - 20, cy + 55, cx - 80 + j, cy + 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crayon shading texture
  ctx.strokeStyle = '#9333ea';
  ctx.lineWidth = 3;
  for (let x = cx - 40; x <= cx + 20; x += 15) {
    ctx.beginPath();
    ctx.moveTo(x, cy + 10 + (frame ? 3 : -3));
    ctx.lineTo(x + 10, cy + 35 + (frame ? -3 : 3));
    ctx.stroke();
  }

  // Jagged dorsal spikes (orange/yellow)
  ctx.fillStyle = '#f97316';
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const sx = cx - 50 + i * 16;
    const sy = cy - 10 - i * 10;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - 4, sy - 14 - (frame ? 2 : 0));
    ctx.lineTo(sx + 8, sy - 2);
    ctx.fill();
    ctx.stroke();
  }

  // Fierce doodle eye
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(cx + 25, cy - 48, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(cx + 27, cy - 48, 3, 0, Math.PI * 2);
  ctx.fill();

  // Sharp pencil teeth in open jaw
  ctx.fillStyle = '#fff';
  ctx.lineWidth = 2;
  for (let x = cx + 20; x <= cx + 45; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, cy - 35);
    ctx.lineTo(x + 4, cy - 28);
    ctx.lineTo(x + 8, cy - 35);
    ctx.fill();
    ctx.stroke();
  }

  // Tiny hilarious T-Rex stick arms
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(cx + 10, cy);
  ctx.lineTo(cx + 24, cy + 6 + (frame ? -4 : 4));
  ctx.lineTo(cx + 28, cy + 2);
  ctx.stroke();

  // Big stomping feet
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + 45);
  ctx.lineTo(cx - 15 + (frame ? -5 : 5), cy + 72);
  ctx.lineTo(cx - 5 + (frame ? -5 : 5), cy + 72);
  ctx.moveTo(cx + 15, cy + 45);
  ctx.lineTo(cx + 10 + (frame ? 5 : -5), cy + 72);
  ctx.lineTo(cx + 20 + (frame ? 5 : -5), cy + 72);
  ctx.stroke();

  ctx.restore();
}

// 3.5 Atirador Rabisco: Flying origami paper plane / doodle bird with a pen nozzle that shoots ink at a distance!
function drawMonsterAtirador(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number) {
  const j = frame * 3;
  ctx.save();

  // Vibrant sky blue and yellow origami bird body
  ctx.fillStyle = '#38bdf8';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Paper wings flapping (angled based on frame)
  const wingY = frame ? -20 : -35;
  ctx.beginPath();
  // Left wing
  ctx.moveTo(cx, cy - 10);
  ctx.lineTo(cx - 75, cy + wingY);
  ctx.lineTo(cx - 30, cy + 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right wing
  ctx.beginPath();
  ctx.moveTo(cx, cy - 10);
  ctx.lineTo(cx + 75, cy + wingY);
  ctx.lineTo(cx + 30, cy + 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Central bird/plane fuselage
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 50 + j); // Tip/beak
  ctx.lineTo(cx + 26, cy + 25);
  ctx.lineTo(cx, cy + 40);
  ctx.lineTo(cx - 26, cy + 25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ballpoint pen nib cannon at beak (disparador de nanquim)
  ctx.fillStyle = '#cbd5e1';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 50 + j);
  ctx.lineTo(cx, cy - 78 + j);
  ctx.lineTo(cx + 8, cy - 50 + j);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Shiny metal ball at pen tip
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(cx, cy - 78 + j, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Aviator goggles with strap
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  // Strap
  ctx.beginPath();
  ctx.moveTo(cx - 24, cy - 25);
  ctx.lineTo(cx + 24, cy - 25);
  ctx.stroke();

  // Goggles lenses
  ctx.fillStyle = '#fde047';
  ctx.beginPath(); ctx.arc(cx - 12, cy - 25, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx + 12, cy - 25, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Pupil reflections
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(cx - 10, cy - 25, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 14, cy - 25, 4, 0, Math.PI * 2); ctx.fill();

  // Origami fold lines and scribbles
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 50 + j);
  ctx.lineTo(cx, cy + 35);
  ctx.stroke();

  // Cute ink drop dripping from beak
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(cx + (frame ? 2 : -2), cy - 86 + j, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 4. Chefe Rabisco: Giant doodle overlord with golden scribbled crown & angry crayon aura
function drawMonsterBoss(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number) {
  const j = frame * 4;
  ctx.save();

  // Crayon aura
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, 95 + j, 0, Math.PI * 2);
  ctx.stroke();

  // Dark charcoal scribbled body
  ctx.fillStyle = '#dc2626';
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(cx - 70 + j, cy + 60);
  ctx.quadraticCurveTo(cx - 90, cy, cx - 60 - j, cy - 50);
  ctx.quadraticCurveTo(cx, cy - 80 + j, cx + 60 + j, cy - 50);
  ctx.quadraticCurveTo(cx + 90, cy, cx + 70 - j, cy + 60);
  ctx.quadraticCurveTo(cx, cy + 85, cx - 70 + j, cy + 60);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden child-drawn crown on top
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 40, cy - 55);
  ctx.lineTo(cx - 45 - j, cy - 90);
  ctx.lineTo(cx - 20, cy - 70);
  ctx.lineTo(cx, cy - 100 + (frame ? 4 : 0));
  ctx.lineTo(cx + 20, cy - 70);
  ctx.lineTo(cx + 45 + j, cy - 90);
  ctx.lineTo(cx + 40, cy - 55);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red jewels on crown
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(cx - 43 - j, cy - 88, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy - 97 + (frame ? 4 : 0), 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 43 + j, cy - 88, 5, 0, Math.PI * 2); ctx.fill();

  // Glowing evil eyes (3 eyes!)
  ctx.fillStyle = '#fef08a';
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 3;
  // Left eye
  ctx.beginPath(); ctx.arc(cx - 32, cy - 20, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Center eye
  ctx.beginPath(); ctx.arc(cx, cy - 30, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Right eye
  ctx.beginPath(); ctx.arc(cx + 32, cy - 20, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Red pupils
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath(); ctx.arc(cx - 32 + (frame ? 2 : -2), cy - 20, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + (frame ? -2 : 2), cy - 30, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 32 + (frame ? 2 : -2), cy - 20, 8, 0, Math.PI * 2); ctx.fill();

  // Giant menacing fanged mouth
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.moveTo(cx - 45, cy + 20);
  ctx.quadraticCurveTo(cx, cy + 55, cx + 45, cy + 20);
  ctx.quadraticCurveTo(cx, cy + 28, cx - 45, cy + 20);
  ctx.fill();
  ctx.stroke();

  // Sharp fangs
  ctx.fillStyle = '#fff';
  for (let x = cx - 35; x <= cx + 35; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, cy + 22);
    ctx.lineTo(x + 6, cy + 34 + (frame ? 3 : 0));
    ctx.lineTo(x + 12, cy + 22);
    ctx.fill();
    ctx.stroke();
  }

  // Boss name scribble badge
  ctx.font = 'bold 20px "Patrick Hand", cursive';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('CHEFE RABISCO', cx - 55, cy + 60);

  ctx.restore();
}

// Doodle Sun for the sky
export function createDoodleSunTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const cx = 256;
  const cy = 256;

  // Yellow scribble sun rays
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI * 2) / 16;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 115, cy + Math.sin(angle) * 115);
    ctx.lineTo(cx + Math.cos(angle) * 180, cy + Math.sin(angle) * 180);
    ctx.stroke();
  }

  // Sun body with crayon scribble
  ctx.fillStyle = '#fde047';
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, cy, 105, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cool sunglasses on the sun!
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  // Left lens
  ctx.moveTo(cx - 70, cy - 25);
  ctx.lineTo(cx - 15, cy - 25);
  ctx.lineTo(cx - 22, cy + 15);
  ctx.lineTo(cx - 65, cy + 15);
  ctx.closePath();
  ctx.fill();
  // Right lens
  ctx.beginPath();
  ctx.moveTo(cx + 15, cy - 25);
  ctx.lineTo(cx + 70, cy - 25);
  ctx.lineTo(cx + 65, cy + 15);
  ctx.lineTo(cx + 22, cy + 15);
  ctx.closePath();
  ctx.fill();
  // Glasses bridge
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#111827';
  ctx.beginPath();
  ctx.moveTo(cx - 15, cy - 18);
  ctx.lineTo(cx + 15, cy - 18);
  ctx.stroke();

  // Cute smiling mouth with red tongue
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy + 30, 35, 0.2, Math.PI - 0.2);
  ctx.stroke();
  // Tongue
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(cx, cy + 50, 15, Math.PI, 0);
  ctx.fill();
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(248, 113, 113, 0.5)';
  ctx.beginPath(); ctx.arc(cx - 50, cy + 30, 14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 50, cy + 30, 14, 0, Math.PI * 2); ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Doodle clouds with child crayon strokes
export function createDoodleCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';

  // Fluffy cloud made of overlapping circles with crayon lines
  ctx.beginPath();
  ctx.arc(140, 140, 60, 0, Math.PI * 2);
  ctx.arc(220, 100, 75, 0, Math.PI * 2);
  ctx.arc(310, 110, 65, 0, Math.PI * 2);
  ctx.arc(370, 150, 50, 0, Math.PI * 2);
  ctx.arc(240, 160, 65, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crayon blue scribble inside cloud
  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = 4;
  for (let x = 120; x <= 360; x += 25) {
    ctx.beginPath();
    ctx.moveTo(x, 130 + (Math.sin(x) * 15));
    ctx.lineTo(x + 15, 145 - (Math.cos(x) * 15));
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

// Doodle Tree texture
export function createDoodleTreeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Brown trunk drawn with crayon
  ctx.fillStyle = '#92400e';
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(110, 480);
  ctx.lineTo(115, 230);
  ctx.lineTo(141, 230);
  ctx.lineTo(146, 480);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Green scribble foliage
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(128, 160, 95, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Foliage scribble texture
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 5;
  for (let a = 0; a < Math.PI * 2; a += 0.4) {
    ctx.beginPath();
    ctx.arc(128 + Math.cos(a) * 45, 160 + Math.sin(a) * 45, 25, 0, Math.PI);
    ctx.stroke();
  }

  // Red doodle apples
  ctx.fillStyle = '#ef4444';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  [[100, 120], [160, 140], [120, 200], [80, 170], [170, 190]].forEach(([ax, ay]) => {
    ctx.beginPath();
    ctx.arc(ax, ay, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  return new THREE.CanvasTexture(canvas);
}

// First-person hand and cardboard gun sprite textures
export function createFirstPersonWeaponTexture(type: 'pistol' | 'shotgun' | 'rifle'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  // Child hand drawn at bottom right with peach crayon
  ctx.fillStyle = '#fde2cf';
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(340, 512);
  ctx.lineTo(330, 410);
  ctx.quadraticCurveTo(320, 370, 360, 360); // Knuckles
  ctx.lineTo(410, 380);
  ctx.lineTo(470, 512);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Child sleeve (striped red & white)
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(335, 470);
  ctx.lineTo(480, 470);
  ctx.lineTo(495, 512);
  ctx.lineTo(340, 512);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (type === 'pistol') {
    // PISTOLA DE PREGADOR & CLIPS
    // Wooden clothespin body
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 5;

    // Main horizontal wooden peg
    ctx.fillRect(180, 310, 190, 42);
    ctx.strokeRect(180, 310, 190, 42);

    // Grip peg
    ctx.fillStyle = '#b45309';
    ctx.fillRect(280, 350, 48, 80);
    ctx.strokeRect(280, 350, 48, 80);

    // Metal spring coiled in center
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(280, 330, 18, 0, Math.PI * 2);
    ctx.stroke();

    // Red taught rubber band
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(180, 320);
    ctx.lineTo(260, 330);
    ctx.lineTo(320, 365);
    ctx.stroke();

    // Shiny silver paperclip loaded at the tip!
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(195, 330);
    ctx.lineTo(135, 330);
    ctx.arc(135, 323, 7, Math.PI / 2, -Math.PI / 2, true);
    ctx.lineTo(170, 316);
    ctx.arc(170, 325, 9, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(145, 334);
    ctx.stroke();

    // Label scribble
    ctx.font = 'bold 18px "Patrick Hand", cursive';
    ctx.fillStyle = '#000';
    ctx.fillText('CLIPS 9MM', 210, 338);

  } else if (type === 'shotgun') {
    // ESPINGARDA DE GIZ DE CERA (TRÊS CANOS)
    const colors = ['#ef4444', '#3b82f6', '#10b981'];
    colors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 5;
      const oy = i * 26;
      // Crayon body
      ctx.fillRect(150 - i * 14, 270 + oy, 210, 24);
      ctx.strokeRect(150 - i * 14, 270 + oy, 210, 24);
      // Crayon pointed tip
      ctx.beginPath();
      ctx.moveTo(150 - i * 14, 270 + oy);
      ctx.lineTo(110 - i * 14, 282 + oy);
      ctx.lineTo(150 - i * 14, 294 + oy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Heavy masking tape holding the 3 crayons
    ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 4;
    ctx.fillRect(220, 260, 60, 95);
    ctx.strokeRect(220, 260, 60, 95);

    // Cardboard shotgun pump grip
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 4;
    ctx.fillRect(210, 355, 65, 30);
    ctx.strokeRect(210, 355, 65, 30);

    // Text on tape
    ctx.font = 'bold 20px "Patrick Hand", cursive';
    ctx.fillStyle = '#854d0e';
    ctx.fillText('3 CANOS CERA', 224, 305);

  } else {
    // RIFLE AUTOMÁTICO DE LÁPIS HB
    // Two long #2 HB pencils forming long automatic barrel
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 5;

    // Top pencil
    ctx.fillRect(100, 285, 260, 20);
    ctx.strokeRect(100, 285, 260, 20);
    // Bottom pencil
    ctx.fillRect(115, 308, 245, 20);
    ctx.strokeRect(115, 308, 245, 20);

    // Sharpened wooden tips
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.moveTo(100, 285);
    ctx.lineTo(60, 295);
    ctx.lineTo(100, 305);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(115, 308);
    ctx.lineTo(75, 318);
    ctx.lineTo(115, 328);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Graphite tips
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.moveTo(75, 291); ctx.lineTo(60, 295); ctx.lineTo(75, 299); ctx.fill();
    ctx.beginPath(); ctx.moveTo(90, 314); ctx.lineTo(75, 318); ctx.lineTo(90, 322); ctx.fill();

    // Plastic clear school ruler as top optical scope rail
    ctx.fillStyle = 'rgba(186, 230, 253, 0.75)';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.fillRect(160, 265, 150, 16);
    ctx.strokeRect(160, 265, 150, 16);
    // Ruler tick marks (1 2 3 4 cm)
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 2;
    for (let x = 170; x <= 300; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, 265);
      ctx.lineTo(x, 274);
      ctx.stroke();
    }

    // Curved pencil case banana magazine (pente de munição longo)
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(250, 330);
    ctx.quadraticCurveTo(230, 390, 200, 440);
    ctx.lineTo(235, 450);
    ctx.quadraticCurveTo(270, 395, 285, 330);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Zipper doodle on magazine
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(242, 335);
    ctx.quadraticCurveTo(225, 390, 210, 445);
    ctx.stroke();

    // Text on pencil
    ctx.font = 'bold 16px "Patrick Hand", cursive';
    ctx.fillStyle = '#000';
    ctx.fillText('FUZIL HB AUTO 30X', 180, 301);
  }

  return new THREE.CanvasTexture(canvas);
}

// House wall texture with child-drawn red crayon bricks and cute windows
export function createHouseWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm cardboard background
  ctx.fillStyle = '#f8f4e5';
  ctx.fillRect(0, 0, 512, 512);

  // Red crayon brick pattern
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;
  const brickH = 40;
  const brickW = 80;

  for (let y = 0; y < 512; y += brickH) {
    // Horizontal mortar line
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < 512; x += 32) {
      ctx.lineTo(x + 16, y + (Math.sin(x * 0.1) * 0.8));
    }
    ctx.stroke();

    // Vertical brick lines offset
    const offset = (y / brickH) % 2 === 0 ? 0 : brickW / 2;
    for (let x = offset; x < 512; x += brickW) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 2, y + brickH);
      ctx.stroke();
    }
  }

  // Cute blue window in center
  ctx.fillStyle = '#bae6fd';
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 6;
  ctx.fillRect(160, 160, 192, 160);
  ctx.strokeRect(160, 160, 192, 160);

  // Window pane cross
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(256, 160); ctx.lineTo(256, 320);
  ctx.moveTo(160, 240); ctx.lineTo(352, 240);
  ctx.stroke();

  // Yellow curtains
  ctx.fillStyle = '#fef08a';
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2.5;
  // Left curtain
  ctx.beginPath();
  ctx.moveTo(160, 160);
  ctx.quadraticCurveTo(210, 240, 160, 320);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Right curtain
  ctx.beginPath();
  ctx.moveTo(352, 160);
  ctx.quadraticCurveTo(302, 240, 352, 320);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Flowers on window sill
  ctx.fillStyle = '#ec4899';
  [190, 230, 280, 320].forEach((fx) => {
    ctx.beginPath();
    ctx.arc(fx, 330, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// House roof texture with folded crayon roof tiles
export function createHouseRoofTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm terracotta red roof paper
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(0, 0, 512, 512);

  // Scalloped roof tiles drawn with crayon
  ctx.strokeStyle = '#9a3412';
  ctx.lineWidth = 3.5;

  const tileW = 64;
  const tileH = 40;

  for (let y = 0; y < 512; y += tileH) {
    const offset = (y / tileH) % 2 === 0 ? 0 : tileW / 2;
    for (let x = -tileW; x < 512 + tileW; x += tileW) {
      ctx.beginPath();
      ctx.arc(x + offset + tileW / 2, y, tileW / 2, 0, Math.PI);
      ctx.stroke();
    }
  }

  // White chalk highlights
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2;
  for (let y = 10; y < 512; y += tileH) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// School cardboard building facade with multi-story windows and chalk clock
export function createBuildingFacadeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Kraft paper cardboard base
  ctx.fillStyle = '#f3eed9';
  ctx.fillRect(0, 0, 512, 1024);

  // Cardboard vertical ridges
  ctx.strokeStyle = 'rgba(180, 150, 100, 0.15)';
  ctx.lineWidth = 4;
  for (let x = 0; x < 512; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x, 1024);
    ctx.stroke();
  }

  // Floors horizontal lines
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 5;
  [260, 520, 780].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(512, y);
    ctx.stroke();
  });

  // Windows in grid
  const windowCols = [80, 200, 320, 440];
  const windowRows = [80, 180, 340, 440, 600, 700, 860];

  windowRows.forEach((wy) => {
    windowCols.forEach((wx) => {
      // Lit window
      ctx.fillStyle = Math.random() < 0.75 ? '#fef08a' : '#bae6fd';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3.5;
      ctx.fillRect(wx - 28, wy - 32, 56, 64);
      ctx.strokeRect(wx - 28, wy - 32, 56, 64);

      // Window cross
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wx, wy - 32); ctx.lineTo(wx, wy + 32);
      ctx.moveTo(wx - 28, wy); ctx.lineTo(wx + 28, wy);
      ctx.stroke();
    });
  });

  // Clock at the top of school building
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 40, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Clock hands (10:10)
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(256, 40); ctx.lineTo(246, 26);
  ctx.moveTo(256, 40); ctx.lineTo(270, 30);
  ctx.stroke();

  // Child poster on ground floor
  ctx.fillStyle = '#ec4899';
  ctx.fillRect(180, 930, 150, 80);
  ctx.strokeStyle = '#0f172a';
  ctx.strokeRect(180, 930, 150, 80);
  ctx.font = 'bold 20px "Patrick Hand", cursive';
  ctx.fillStyle = '#fff';
  ctx.fillText('ESCOLA DO RABISCO', 188, 975);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// 3D Ammo Box Textures (Clips, Giz, Lápis, Mochila)
export function createAmmoBoxTexture(type: 'pistol' | 'shotgun' | 'rifle' | 'all'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  let bgColor = '#ef4444';
  let title = 'MUNIÇÃO';
  let iconText = 'CLIPS';

  if (type === 'pistol') {
    bgColor = '#38bdf8';
    title = 'CLIPS';
    iconText = 'PISTOLA';
  } else if (type === 'shotgun') {
    bgColor = '#ef4444';
    title = 'CARTUCHOS';
    iconText = 'GIZ CERA';
  } else if (type === 'rifle') {
    bgColor = '#eab308';
    title = 'PENTE HB';
    iconText = 'RIFLE 30X';
  } else {
    bgColor = '#10b981';
    title = 'MOCHILA';
    iconText = 'MUNIÇÃO TOTAL';
  }

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 256, 256);

  // Border and scotch tape
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, 256, 256);

  ctx.fillStyle = 'rgba(255, 255, 230, 0.8)';
  ctx.fillRect(20, 100, 216, 56);
  ctx.strokeRect(20, 100, 216, 56);

  // Text
  ctx.font = 'bold 26px "Patrick Hand", cursive';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(title, 128, 70);

  ctx.font = 'bold 22px "Patrick Hand", cursive';
  ctx.fillStyle = '#854d0e';
  ctx.fillText(iconText, 128, 136);

  // Star doodles
  ctx.fillStyle = '#ffffff';
  ctx.fillText('★ ★ ★', 128, 200);

  return new THREE.CanvasTexture(canvas);
}

// Enemy ink projectile texture (bolinha de nanquim preto voadora com rastro)
export function createEnemyInkProjectileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const cx = 64;
  const cy = 64;

  // Dark charcoal / ink splat
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.arc(cx, cy, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Mischievous glowing red eyes
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(cx - 12, cy - 8, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 12, cy - 8, 8, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(cx - 10, cy - 10, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 14, cy - 10, 3, 0, Math.PI * 2); ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

// Comic action text bubble ("POW!", "POF!", "ZAP!", "SPLASH!")
export function createComicPopupTexture(text: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const cx = 128;
  const cy = 64;

  // Jagged comic blast bubble
  ctx.fillStyle = color;
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 5;
  ctx.lineJoin = 'miter';

  ctx.beginPath();
  const numPoints = 12;
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * Math.PI * 2) / numPoints;
    const r = i % 2 === 0 ? 58 : 34;
    const px = cx + Math.cos(angle) * (r * 1.5);
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bold handwritten comic text
  ctx.font = 'bold 36px "Architects Daughter", "Patrick Hand", cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#000000';
  ctx.strokeText(text, cx, cy);
  ctx.fillText(text, cx, cy);

  return new THREE.CanvasTexture(canvas);
}
