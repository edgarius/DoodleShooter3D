import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { GameState, WeaponType, WeaponInfo, EnemyType, PlayerStats } from '../types';
import {
  createNotebookPaperTexture,
  createGridPaperTexture,
  createCardboardTexture,
  createEnemyTextures,
  createDoodleSunTexture,
  createDoodleCloudTexture,
  createDoodleTreeTexture,
  createFirstPersonWeaponTexture,
  createComicPopupTexture,
  createHouseWallTexture,
  createHouseRoofTexture,
  createBuildingFacadeTexture,
  createAmmoBoxTexture,
  createEnemyInkProjectileTexture,
} from './doodleTextures';
import { sounds } from './soundEffects';

export interface EnemyEntity {
  id: number;
  mesh: THREE.Mesh;
  type: EnemyType;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  scoreValue: number;
  textures: THREE.CanvasTexture[];
  frame: number;
  frameTimer: number;
  hopTime: number;
  attackCooldown: number;
  shootCooldown: number;
  radius: number;
  height: number;
  strafeDir: number;
  strafeTimer: number;
}

export interface Projectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  damage: number;
  life: number;
  maxLife: number;
  type: 'clip' | 'crayon' | 'pencil';
}

export interface EnemyProjectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  damage: number;
  life: number;
  maxLife: number;
}

export interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  life: number;
  maxLife: number;
}

export interface ComicPopup {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export interface Powerup {
  mesh: THREE.Group;
  type: 'health' | 'ammo_pistol' | 'ammo_shotgun' | 'ammo_rifle' | 'ammo_all' | 'eraser' | 'gold';
  pos: THREE.Vector3;
  rotSpeed: number;
}

export class ShooterEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // Game callbacks
  public onStatsChange?: (stats: PlayerStats) => void;
  public onWeaponChange?: (weapon: WeaponInfo) => void;
  public onGameStateChange?: (state: GameState) => void;
  public onBannerMessage?: (text: string, subtext?: string) => void;

  // Player state
  private playerPos = new THREE.Vector3(0, 1.7, 0);
  private playerVel = new THREE.Vector3();
  private pitch = 0; // Look up/down
  private yaw = 0;   // Look left/right
  private isGrounded = true;
  private walkBob = 0;
  private isPointerLocked = false;
  private touchLookStart = { x: 0, y: 0 };

  // Keys
  private keys: { [key: string]: boolean } = {
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Space: false,
  };
  private isShooting = false;
  private lastShotTime = 0;
  private isReloading = false;

  // Weapons (Pistola, Espingarda, Rifle com munição e reservas individuais)
  public weapons: Record<WeaponType, WeaponInfo> = {
    pistol: {
      id: 'pistol',
      name: 'Pistola de Pregador',
      subname: 'Madeira, Elástico e Clips',
      damage: 34,
      fireRateMs: 220,
      maxAmmo: 12,
      currentAmmo: 12,
      reserveAmmo: 60,
      maxReserveAmmo: 144,
      reloadTimeMs: 800,
      bulletSpeed: 75,
      spread: 0.012,
      pellets: 1,
      color: '#38bdf8',
      projectileType: 'clip',
      description: 'Disparo ágil de clips metálicos com estalo de pregador!',
    },
    shotgun: {
      id: 'shotgun',
      name: 'Espingarda de Giz',
      subname: 'Três Canos de Giz de Cera',
      damage: 16, // 7 pellets * 16 = 112 dano total a queima-roupa
      fireRateMs: 650,
      maxAmmo: 6,
      currentAmmo: 6,
      reserveAmmo: 24,
      maxReserveAmmo: 60,
      reloadTimeMs: 1200,
      bulletSpeed: 48,
      spread: 0.11,
      pellets: 7,
      color: '#ef4444',
      projectileType: 'crayon',
      description: 'Disparo em leque de lascas de giz multicolorido!',
    },
    rifle: {
      id: 'rifle',
      name: 'Rifle de Lápis HB',
      subname: 'Fuzil Automático Escolar',
      damage: 22,
      fireRateMs: 100, // Automático contínuo super rápido
      maxAmmo: 30,
      currentAmmo: 30,
      reserveAmmo: 90,
      maxReserveAmmo: 240,
      reloadTimeMs: 1100,
      bulletSpeed: 85,
      spread: 0.028,
      pellets: 1,
      color: '#eab308',
      projectileType: 'pencil',
      description: 'Rajada contínua veloz de grafite com mira de régua!',
    },
  };
  public currentWeaponType: WeaponType = 'pistol';

  // Game Stats
  public stats: PlayerStats = {
    health: 100,
    maxHealth: 100,
    score: 0,
    highScore: 0,
    wave: 1,
    kills: 0,
    combo: 0,
    comboTimer: 0,
    enemiesRemainingInWave: 8,
    enemiesAlive: 0,
  };

  // Wave Control & Strict Performance Management (5 to 10 max enemies alive)
  private readonly MAX_ALIVE_ENEMIES = 7;
  private waveTotalEnemies = 8;
  private enemiesSpawnedInWave = 0;
  private enemiesKilledInWave = 0;
  private spawnIntervalTimer = 0;

  // Hidden spawn points (behind houses, inside alleys, behind buildings)
  private hiddenSpawnPoints: THREE.Vector3[] = [
    new THREE.Vector3(-18, 0, -22), // Atrás da Casa 1
    new THREE.Vector3(-22, 0, 24),  // Atrás do Prédio 1
    new THREE.Vector3(20, 0, 24),   // Atrás da Casa 2
    new THREE.Vector3(18, 0, -26),  // Atrás do Prédio 2
    new THREE.Vector3(0, 0, -34),   // Atrás da Casinha 3
    new THREE.Vector3(-32, 0, -4),  // Beco Oeste
    new THREE.Vector3(32, 0, 4),    // Beco Leste
    new THREE.Vector3(0, 0, 32),    // Esquina Sul
    new THREE.Vector3(-14, 0, 2),   // Beco entre Casa 1 e Centro
    new THREE.Vector3(14, 0, -2),   // Beco entre Prédio 2 e Centro
  ];

  // State
  public gameState: GameState = 'menu';
  private rapidFireTimer = 0;
  private cameraShake = 0;

  // World objects
  private colliders: THREE.Box3[] = [];
  private enemies: EnemyEntity[] = [];
  private nextEnemyId = 1;
  private projectiles: Projectile[] = [];
  private enemyProjectiles: EnemyProjectile[] = [];
  private particles: Particle[] = [];
  private popups: ComicPopup[] = [];
  private powerups: Powerup[] = [];

  // Visuals
  private weaponMesh: THREE.Mesh | null = null;
  private weaponRecoil = 0;
  private sunMesh: THREE.Mesh | null = null;
  private clouds: THREE.Mesh[] = [];
  private arenaSize = 80; // Arena is -40 to +40

  // Textures cache
  private enemyTextureCache: { [key in EnemyType]?: THREE.CanvasTexture[] } = {};
  private inkProjectileTexture: THREE.CanvasTexture | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // High score from local storage
    const savedHighScore = localStorage.getItem('doodle_shooter_highscore');
    if (savedHighScore) {
      this.stats.highScore = parseInt(savedHighScore, 10) || 0;
    }

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#dbeafe');
    this.scene.fog = new THREE.FogExp2('#dbeafe', 0.012);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      300
    );
    this.camera.position.copy(this.playerPos);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight('#fffbf0', 0.9);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#fff5cc', 1.0);
    dirLight.position.set(40, 70, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 180;
    const d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    this.scene.add(dirLight);

    // 5. Build Environment with Houses and Buildings
    this.buildNotebookEnvironment();

    // 6. Setup First-person Weapon
    this.setupFirstPersonWeapon();

    // 7. Event listeners
    this.initEventListeners();
  }

  // Preload textures
  private getEnemyTextures(type: EnemyType): THREE.CanvasTexture[] {
    if (!this.enemyTextureCache[type]) {
      this.enemyTextureCache[type] = createEnemyTextures(type);
    }
    return this.enemyTextureCache[type]!;
  }

  private getInkProjectileTexture(): THREE.CanvasTexture {
    if (!this.inkProjectileTexture) {
      this.inkProjectileTexture = createEnemyInkProjectileTexture();
    }
    return this.inkProjectileTexture;
  }

  // Build the notebook paper arena with cardboard houses and buildings
  private buildNotebookEnvironment() {
    // A. Notebook Paper Floor
    const floorTex = createNotebookPaperTexture();
    const floorMat = new THREE.MeshLambertMaterial({
      map: floorTex,
    });
    const floorGeo = new THREE.PlaneGeometry(this.arenaSize, this.arenaSize);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // B. Arena Boundary Walls (Cardboard & Grid Paper)
    const wallHeight = 5.5;
    const wallTex = createGridPaperTexture();
    const wallMat = new THREE.MeshLambertMaterial({
      map: wallTex,
      side: THREE.DoubleSide,
    });

    const half = this.arenaSize / 2;
    const wallDefs = [
      { pos: [0, wallHeight / 2, -half], rot: [0, 0, 0] },
      { pos: [0, wallHeight / 2, half], rot: [0, Math.PI, 0] },
      { pos: [-half, wallHeight / 2, 0], rot: [0, Math.PI / 2, 0] },
      { pos: [half, wallHeight / 2, 0], rot: [0, -Math.PI / 2, 0] },
    ];

    wallDefs.forEach(({ pos, rot }) => {
      const geo = new THREE.PlaneGeometry(this.arenaSize, wallHeight);
      const wall = new THREE.Mesh(geo, wallMat);
      wall.position.set(pos[0], pos[1], pos[2]);
      wall.rotation.set(rot[0], rot[1], rot[2]);
      wall.receiveShadow = true;
      this.scene.add(wall);

      // Boundary box collider
      const box = new THREE.Box3();
      box.setFromCenterAndSize(
        new THREE.Vector3(pos[0], wallHeight / 2, pos[1] === 0 ? pos[2] : pos[2]),
        new THREE.Vector3(pos[2] === 0 ? 1 : this.arenaSize, wallHeight, pos[0] === 0 ? 1 : this.arenaSize)
      );
      this.colliders.push(box);
    });

    // C. Smiling Doodle Sun
    const sunTex = createDoodleSunTexture();
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTex,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const sunGeo = new THREE.PlaneGeometry(12, 12);
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.sunMesh.position.set(28, 38, -48);
    this.sunMesh.lookAt(0, 0, 0);
    this.scene.add(this.sunMesh);

    // D. Doodle Clouds
    const cloudTex = createDoodleCloudTexture();
    const cloudMat = new THREE.MeshBasicMaterial({
      map: cloudTex,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const cloudGeo = new THREE.PlaneGeometry(14, 7);

    [
      [-25, 32, -35],
      [15, 36, -42],
      [-10, 30, 35],
      [22, 34, 30],
    ].forEach(([x, y, z]) => {
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set(x, y, z);
      cloud.lookAt(x, y, 0);
      this.scene.add(cloud);
      this.clouds.push(cloud);
    });

    // E. Cardboard Houses with Red Crayon Bricks & Folded Roofs
    const houseWallTex = createHouseWallTexture();
    const houseWallMat = new THREE.MeshLambertMaterial({ map: houseWallTex });

    const houseRoofTex = createHouseRoofTexture();
    const houseRoofMat = new THREE.MeshLambertMaterial({ map: houseRoofTex });

    const housesData = [
      { x: -18, z: -16, w: 9, h: 5.2, d: 8 },
      { x: 20, z: 18, w: 9, h: 5.2, d: 8 },
      { x: 0, z: -28, w: 8, h: 4.8, d: 7 },
    ];

    housesData.forEach(({ x, z, w, h, d: depth }) => {
      // House Body
      const bodyGeo = new THREE.BoxGeometry(w, h, depth);
      const bodyMesh = new THREE.Mesh(bodyGeo, houseWallMat);
      bodyMesh.position.set(x, h / 2, z);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      this.scene.add(bodyMesh);

      // House Roof (Pyramidal triangular card prism)
      const roofH = 2.4;
      const roofGeo = new THREE.ConeGeometry(Math.max(w, depth) * 0.72, roofH, 4);
      const roofMesh = new THREE.Mesh(roofGeo, houseRoofMat);
      roofMesh.position.set(x, h + roofH / 2, z);
      roofMesh.rotation.y = Math.PI / 4;
      roofMesh.castShadow = true;
      this.scene.add(roofMesh);

      // Collider
      const houseBox = new THREE.Box3();
      houseBox.setFromObject(bodyMesh);
      this.colliders.push(houseBox);
    });

    // F. Cardboard School Buildings (Multi-story with windows & clock)
    const buildingFacadeTex = createBuildingFacadeTexture();
    const buildingMat = new THREE.MeshLambertMaterial({ map: buildingFacadeTex });

    const buildingsData = [
      { x: -22, z: 18, w: 10, h: 10, d: 8 },
      { x: 18, z: -20, w: 10, h: 9.5, d: 8 },
    ];

    buildingsData.forEach(({ x, z, w, h, d: depth }) => {
      const bGeo = new THREE.BoxGeometry(w, h, depth);
      const bMesh = new THREE.Mesh(bGeo, buildingMat);
      bMesh.position.set(x, h / 2, z);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      this.scene.add(bMesh);

      // School building box collider
      const bBox = new THREE.Box3();
      bBox.setFromObject(bMesh);
      this.colliders.push(bBox);
    });

    // G. Cover Crates / Cardboard Obstacles
    const cardboardTex = createCardboardTexture();
    const boxMat = new THREE.MeshLambertMaterial({ map: cardboardTex });

    const smallBoxes = [
      { pos: [-6, 1.2, -6], size: [2.4, 2.4, 2.4] },
      { pos: [7, 1.2, 7], size: [2.4, 2.4, 2.4] },
      { pos: [-8, 0.8, 8], size: [2.0, 1.6, 2.0] },
      { pos: [8, 0.8, -7], size: [2.0, 1.6, 2.0] },
      { pos: [0, 1.0, 12], size: [3.2, 2.0, 1.5] },
    ];

    smallBoxes.forEach(({ pos, size }) => {
      const geo = new THREE.BoxGeometry(size[0], size[1], size[2]);
      const mesh = new THREE.Mesh(geo, boxMat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      const box = new THREE.Box3();
      box.setFromObject(mesh);
      this.colliders.push(box);
    });

    // H. Doodle Trees (Paper Cutout Billboards)
    const treeTex = createDoodleTreeTexture();
    const treeMat = new THREE.MeshLambertMaterial({
      map: treeTex,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.1,
    });
    const treeGeo = new THREE.PlaneGeometry(4, 7);

    const treePositions = [
      [-6, 3.5, 22],
      [6, 3.5, -12],
      [-28, 3.5, -2],
      [28, 3.5, 2],
      [-5, 3.5, -16],
    ];

    treePositions.forEach(([x, y, z]) => {
      const tree = new THREE.Mesh(treeGeo, treeMat);
      tree.position.set(x, y, z);
      tree.castShadow = true;
      this.scene.add(tree);

      const trunkBox = new THREE.Box3(
        new THREE.Vector3(x - 0.5, 0, z - 0.5),
        new THREE.Vector3(x + 0.5, 4, z + 0.5)
      );
      this.colliders.push(trunkBox);
    });
  }

  // Setup the animated first-person paper weapon
  private setupFirstPersonWeapon() {
    const tex = createFirstPersonWeaponTexture(this.currentWeaponType);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
    });
    const geo = new THREE.PlaneGeometry(0.8, 0.8);
    this.weaponMesh = new THREE.Mesh(geo, mat);
    this.weaponMesh.position.set(0.32, -0.28, -0.55);
    this.camera.add(this.weaponMesh);
    this.scene.add(this.camera);
  }

  public updateWeaponTexture() {
    if (!this.weaponMesh) return;
    const tex = createFirstPersonWeaponTexture(this.currentWeaponType);
    (this.weaponMesh.material as THREE.MeshBasicMaterial).map = tex;
    (this.weaponMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
  }

  // Event Listeners for Keyboard, Mouse & Pointer Lock
  private initEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (this.keys[e.code] !== undefined) {
        this.keys[e.code] = true;
      }
      // Weapon switch keys 1, 2, 3
      if (e.code === 'Digit1') this.switchWeapon('pistol');
      if (e.code === 'Digit2') this.switchWeapon('shotgun');
      if (e.code === 'Digit3') this.switchWeapon('rifle');
      // Reload key R
      if (e.code === 'KeyR') this.reload();
      // Pause key ESC or P
      if (e.code === 'KeyP') this.togglePause();
    });

    window.addEventListener('keyup', (e) => {
      if (this.keys[e.code] !== undefined) {
        this.keys[e.code] = false;
      }
    });

    // Mouse events on container
    this.container.addEventListener('mousedown', (e) => {
      if (this.gameState !== 'playing') return;
      if (e.button === 0) {
        if (!this.isPointerLocked) {
          this.container.requestPointerLock?.();
        }
        this.isShooting = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isShooting = false;
      }
    });

    // Mouse Look via PointerLock
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.container;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isPointerLocked || this.gameState !== 'playing') return;
      const sensitivity = 0.0022;
      this.yaw -= e.movementX * sensitivity;
      this.pitch -= e.movementY * sensitivity;
      // Clamp pitch to avoid neck flip
      this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
    });

    // Resize
    window.addEventListener('resize', this.onWindowResize);
  }

  private onWindowResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  // Touch look handler
  public handleTouchLook(dx: number, dy: number) {
    const sensitivity = 0.005;
    this.yaw -= dx * sensitivity;
    this.pitch -= dy * sensitivity;
    this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
  }

  public handleTouchMove(moveX: number, moveZ: number) {
    this.keys.KeyW = moveZ < -0.3;
    this.keys.KeyS = moveZ > 0.3;
    this.keys.KeyA = moveX < -0.3;
    this.keys.KeyD = moveX > 0.3;
  }

  public handleTouchShoot(active: boolean) {
    this.isShooting = active;
  }

  public handleTouchJump() {
    if (this.isGrounded) {
      this.playerVel.y = 8.5;
      this.isGrounded = false;
      sounds.playJump();
    }
  }

  // Weapon switching
  public switchWeapon(type: WeaponType) {
    if (this.currentWeaponType === type) return;
    this.currentWeaponType = type;
    this.updateWeaponTexture();
    this.onWeaponChange?.(this.weapons[type]);
    sounds.playReload();
  }

  // Reload current weapon with realistic ammo consumption from reserve
  public reload() {
    const w = this.weapons[this.currentWeaponType];
    if (w.currentAmmo === w.maxAmmo || this.isReloading) return;

    if (w.reserveAmmo <= 0) {
      this.onBannerMessage?.('SEM MUNIÇÃO!', `Encontre caixas de ${w.name} no mapa!`);
      sounds.playHit();
      return;
    }

    this.isReloading = true;
    sounds.playReload();

    setTimeout(() => {
      const needed = w.maxAmmo - w.currentAmmo;
      const amountToLoad = Math.min(needed, w.reserveAmmo);
      w.currentAmmo += amountToLoad;
      w.reserveAmmo -= amountToLoad;
      this.isReloading = false;
      this.onWeaponChange?.(w);
    }, w.reloadTimeMs);
  }

  // Start a new game
  public startGame() {
    this.stats = {
      health: 100,
      maxHealth: 100,
      score: 0,
      highScore: this.stats.highScore,
      wave: 1,
      kills: 0,
      combo: 0,
      comboTimer: 0,
      enemiesRemainingInWave: 8,
      enemiesAlive: 0,
    };

    // Reset weapons ammo and reserves
    this.weapons.pistol.currentAmmo = 12;
    this.weapons.pistol.reserveAmmo = 60;
    this.weapons.shotgun.currentAmmo = 6;
    this.weapons.shotgun.reserveAmmo = 24;
    this.weapons.rifle.currentAmmo = 30;
    this.weapons.rifle.reserveAmmo = 90;

    // Reset player position
    this.playerPos.set(0, 1.7, 0);
    this.playerVel.set(0, 0, 0);
    this.pitch = 0;
    this.yaw = 0;

    // Clear existing dynamic objects
    this.clearDynamicObjects();

    this.gameState = 'playing';
    this.onGameStateChange?.('playing');
    this.onStatsChange?.(this.stats);
    this.onWeaponChange?.(this.weapons[this.currentWeaponType]);

    sounds.startMusic();
    this.startWave(1);

    if (!this.isRunning) {
      this.startLoop();
    }
  }

  public togglePause() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.onGameStateChange?.('paused');
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.onGameStateChange?.('playing');
    }
  }

  private clearDynamicObjects() {
    this.enemies.forEach((e) => this.scene.remove(e.mesh));
    this.enemies = [];
    this.projectiles.forEach((p) => this.scene.remove(p.mesh));
    this.projectiles = [];
    this.enemyProjectiles.forEach((p) => this.scene.remove(p.mesh));
    this.enemyProjectiles = [];
    this.particles.forEach((p) => this.scene.remove(p.mesh));
    this.particles = [];
    this.popups.forEach((pop) => this.scene.remove(pop.mesh));
    this.popups = [];
    this.powerups.forEach((pw) => this.scene.remove(pw.mesh));
    this.powerups = [];
  }

  // Wave System with Strict Maximum of 5 to 10 Alive Enemies for Top Performance!
  private startWave(waveNumber: number) {
    this.stats.wave = waveNumber;
    this.enemiesKilledInWave = 0;
    this.enemiesSpawnedInWave = 0;

    // Wave quotas (calculated gracefully)
    if (waveNumber === 1) {
      this.waveTotalEnemies = 8;
    } else if (waveNumber === 2) {
      this.waveTotalEnemies = 12;
    } else if (waveNumber === 3) {
      this.waveTotalEnemies = 16;
    } else if (waveNumber === 4) {
      this.waveTotalEnemies = 20;
    } else if (waveNumber === 5) {
      this.waveTotalEnemies = 12; // Boss + 11 minions
    } else {
      this.waveTotalEnemies = Math.min(35, 16 + (waveNumber - 5) * 3);
    }

    this.stats.enemiesRemainingInWave = this.waveTotalEnemies;
    this.stats.enemiesAlive = 0;
    this.onStatsChange?.(this.stats);

    let title = `ONDA ${waveNumber}!`;
    let subtitle = `Derrote ${this.waveTotalEnemies} rabiscos nos prédios e casas!`;

    if (waveNumber === 5 || waveNumber % 5 === 0) {
      title = '★ CHEFE RABISCO ★';
      subtitle = 'Cuidado com o Rei dos Rabiscos e seus ataques de nanquim!';
    }

    this.onBannerMessage?.(title, subtitle);
    sounds.playWaveClear();

    // Spawn initial pack (limited to 5-6)
    setTimeout(() => {
      if (this.gameState !== 'playing') return;
      const initialCount = Math.min(5, this.waveTotalEnemies);
      for (let i = 0; i < initialCount; i++) {
        this.spawnNextWaveEnemy();
      }
    }, 1000);

    // Spawn 2-3 tactical ammo boxes around the arena each wave
    this.spawnPowerup('ammo_pistol');
    this.spawnPowerup('ammo_shotgun');
    this.spawnPowerup('ammo_rifle');
    if (waveNumber >= 2) this.spawnPowerup('health');
    if (waveNumber >= 3 && Math.random() < 0.6) this.spawnPowerup('eraser');
  }

  // Determine enemy type based on current wave progression
  private getNextEnemyTypeForWave(): EnemyType {
    const wave = this.stats.wave;

    // Boss wave: first enemy is the boss!
    if ((wave === 5 || wave % 5 === 0) && this.enemiesSpawnedInWave === 0) {
      return 'boss';
    }

    if (wave === 1) {
      // Wave 1: Mostly Zoio (jumpers) and Dino (rushers)
      return Math.random() < 0.65 ? 'zoio' : 'dino';
    } else if (wave === 2) {
      // Wave 2: Introduces Atirador (ranged origami bird) and Robo (tank)
      const roll = Math.random();
      if (roll < 0.35) return 'zoio';
      if (roll < 0.65) return 'dino';
      return 'atirador';
    } else if (wave === 3) {
      // Wave 3: Robo tank + Atirador + Dino
      const roll = Math.random();
      if (roll < 0.3) return 'atirador';
      if (roll < 0.6) return 'robo';
      if (roll < 0.85) return 'dino';
      return 'zoio';
    } else {
      // Advanced waves: all types distributed
      const types: EnemyType[] = ['zoio', 'robo', 'dino', 'atirador'];
      return types[Math.floor(Math.random() * types.length)];
    }
  }

  // Spawns one enemy from hidden corners/behind buildings if below max alive limit
  private spawnNextWaveEnemy() {
    if (this.enemies.length >= this.MAX_ALIVE_ENEMIES) return;
    if (this.enemiesSpawnedInWave >= this.waveTotalEnemies) return;

    const type = this.getNextEnemyTypeForWave();
    this.spawnEnemyAtHiddenLocation(type);
    this.enemiesSpawnedInWave++;
    this.stats.enemiesAlive = this.enemies.length;
    this.stats.enemiesRemainingInWave = this.waveTotalEnemies - this.enemiesKilledInWave;
    this.onStatsChange?.(this.stats);
  }

  // Pick a hidden spawn point that is away from the player's direct close vision
  private pickHiddenSpawnPoint(): THREE.Vector3 {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    // Filter points at least 13m away
    const validPoints = this.hiddenSpawnPoints.filter((pt) => {
      const dist = pt.distanceTo(this.playerPos);
      if (dist < 13) return false;

      // Check if point is behind or to the side of the player (not right in their face)
      const toPt = pt.clone().sub(this.playerPos).normalize();
      const dot = forward.dot(toPt);
      return dot < 0.5; // Outside narrow front frustum
    });

    if (validPoints.length > 0) {
      return validPoints[Math.floor(Math.random() * validPoints.length)].clone();
    }

    // Fallback: any hidden point
    return this.hiddenSpawnPoints[Math.floor(Math.random() * this.hiddenSpawnPoints.length)].clone();
  }

  private spawnEnemyAtHiddenLocation(type: EnemyType) {
    const textures = this.getEnemyTextures(type);

    let size = 2.4;
    let height = 2.4;
    let health = 60;
    let speed = 3.6;
    let damage = 12;
    let scoreValue = 100;

    if (type === 'robo') {
      // Melee Heavy Tank: Slow, high HP, heavy ground punch
      size = 2.8;
      height = 3.0;
      health = 180;
      speed = 2.3;
      damage = 25;
      scoreValue = 220;
    } else if (type === 'dino') {
      // Fast Rusher: High speed, zigzag avoidance, quick bite
      size = 3.0;
      height = 2.8;
      health = 110;
      speed = 6.2;
      damage = 18;
      scoreValue = 200;
    } else if (type === 'atirador') {
      // Ranged Attacker: Flying origami bird with pen cannon, strafes and shoots ink
      size = 2.7;
      height = 2.7;
      health = 90;
      speed = 3.8;
      damage = 14;
      scoreValue = 250;
    } else if (type === 'boss') {
      // Boss Overlord: Huge, massive health, alternates stomps and ink volleys
      size = 6.5;
      height = 6.5;
      health = 1100;
      speed = 2.8;
      damage = 32;
      scoreValue = 2500;
    }

    // Wave scale
    if (this.stats.wave > 5) {
      health *= 1 + (this.stats.wave - 5) * 0.12;
      speed = Math.min(6.8, speed * (1 + (this.stats.wave - 5) * 0.04));
    }

    // Billboard plane
    const geo = new THREE.PlaneGeometry(size, height);
    const mat = new THREE.MeshBasicMaterial({
      map: textures[0],
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.15,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;

    // Position at chosen hidden point with slight jitter
    const spawnPt = this.pickHiddenSpawnPoint();
    spawnPt.x += (Math.random() - 0.5) * 2;
    spawnPt.z += (Math.random() - 0.5) * 2;
    mesh.position.set(spawnPt.x, height / 2 + (type === 'atirador' ? 1.5 : 0), spawnPt.z);

    this.scene.add(mesh);

    const enemy: EnemyEntity = {
      id: this.nextEnemyId++,
      mesh,
      type,
      health,
      maxHealth: health,
      speed,
      damage,
      scoreValue,
      textures,
      frame: 0,
      frameTimer: 0,
      hopTime: Math.random() * 10,
      attackCooldown: 0,
      shootCooldown: 1.5 + Math.random() * 1.5,
      radius: size * 0.38,
      height,
      strafeDir: Math.random() < 0.5 ? 1 : -1,
      strafeTimer: 2.0,
    };

    this.enemies.push(enemy);
  }

  // Spawn dynamic 3D ammo box or powerup in arena with custom drawn textures
  public spawnPowerup(
    type: 'health' | 'ammo_pistol' | 'ammo_shotgun' | 'ammo_rifle' | 'ammo_all' | 'eraser' | 'gold',
    customPos?: THREE.Vector3
  ) {
    const group = new THREE.Group();

    let ammoType: 'pistol' | 'shotgun' | 'rifle' | 'all' = 'pistol';
    if (type === 'ammo_shotgun') ammoType = 'shotgun';
    else if (type === 'ammo_rifle') ammoType = 'rifle';
    else if (type === 'ammo_all') ammoType = 'all';

    const boxTex = createAmmoBoxTexture(ammoType);
    const boxMat = new THREE.MeshLambertMaterial({ map: boxTex });

    const geo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const cube = new THREE.Mesh(geo, boxMat);
    cube.castShadow = true;
    group.add(cube);

    // Random spot on streets or passed position
    let x = (Math.random() - 0.5) * 44;
    let z = (Math.random() - 0.5) * 44;
    if (customPos) {
      x = customPos.x;
      z = customPos.z;
    }

    group.position.set(x, 1.0, z);
    this.scene.add(group);

    this.powerups.push({
      mesh: group,
      type,
      pos: group.position,
      rotSpeed: 1.8,
    });
  }

  // Shoot current weapon (Pistol, Shotgun, Rifle)
  private shoot() {
    const w = this.weapons[this.currentWeaponType];
    const now = performance.now();
    const fireRate = this.rapidFireTimer > 0 ? w.fireRateMs * 0.5 : w.fireRateMs;

    if (now - this.lastShotTime < fireRate) return;
    if (this.isReloading) return;

    if (w.currentAmmo <= 0) {
      this.reload();
      return;
    }

    this.lastShotTime = now;
    w.currentAmmo--;
    this.onWeaponChange?.(w);

    // Play sound
    sounds.playShoot(w.projectileType);

    // Recoil and camera shake
    this.weaponRecoil = w.id === 'shotgun' ? 0.22 : w.id === 'rifle' ? 0.08 : 0.12;
    this.cameraShake = w.id === 'shotgun' ? 0.08 : 0.025;

    // Direction vector from camera
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);

    // Spawn pellets/projectiles
    for (let i = 0; i < w.pellets; i++) {
      const spreadDir = dir.clone();
      if (w.spread > 0) {
        spreadDir.x += (Math.random() - 0.5) * w.spread;
        spreadDir.y += (Math.random() - 0.5) * w.spread;
        spreadDir.z += (Math.random() - 0.5) * w.spread;
        spreadDir.normalize();
      }

      this.createProjectile(spreadDir, w);
    }
  }

  // Create Projectile (Paperclip for Pistol, Crayon shrapnel for Shotgun, Graphite dart for Rifle)
  private createProjectile(dir: THREE.Vector3, w: WeaponInfo) {
    let mesh: THREE.Mesh;

    if (w.projectileType === 'clip') {
      // Metallic shiny paperclip cylinder/torus
      const geo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6);
      const mat = new THREE.MeshLambertMaterial({ color: '#38bdf8' });
      mesh = new THREE.Mesh(geo, mat);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    } else if (w.projectileType === 'pencil') {
      // Long yellow pencil dart with sharp graphite tip
      const geo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6);
      const mat = new THREE.MeshLambertMaterial({ color: '#eab308' });
      mesh = new THREE.Mesh(geo, mat);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    } else {
      // Multicolored crayon cone shrapnel
      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const geo = new THREE.ConeGeometry(0.12, 0.45, 5);
      const mat = new THREE.MeshLambertMaterial({ color: randomColor });
      mesh = new THREE.Mesh(geo, mat);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    }

    // Spawn at weapon tip in front of camera
    const spawnPos = this.camera.position.clone().add(dir.clone().multiplyScalar(0.75));
    spawnPos.y -= 0.12;
    mesh.position.copy(spawnPos);
    mesh.castShadow = true;
    this.scene.add(mesh);

    const projectile: Projectile = {
      mesh,
      velocity: dir.clone().multiplyScalar(w.bulletSpeed),
      damage: w.damage * (this.rapidFireTimer > 0 ? 1.5 : 1),
      life: 0,
      maxLife: 2.5,
      type: w.projectileType,
    };

    this.projectiles.push(projectile);
  }

  // Create Enemy Ink Projectile (shot by Atirador and Boss)
  private createEnemyInkProjectile(fromPos: THREE.Vector3, targetPos: THREE.Vector3, damage = 14) {
    const tex = this.getInkProjectileTexture();
    const geo = new THREE.PlaneGeometry(0.9, 0.9);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.15,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(fromPos);
    this.scene.add(mesh);

    // Aim toward player
    const dir = targetPos.clone().sub(fromPos).normalize();
    // Add slight random arch
    dir.y += 0.06;
    dir.normalize();

    const speed = 20;
    this.enemyProjectiles.push({
      mesh,
      velocity: dir.multiplyScalar(speed),
      damage,
      life: 0,
      maxLife: 4.0,
    });

    sounds.playEnemyShoot();
  }

  // Spawn Comic Popup ("POW!", "POF!", "ZAP!")
  private spawnComicPopup(text: string, pos: THREE.Vector3, color = '#f59e0b') {
    const tex = createComicPopupTexture(text, color);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
    });
    const geo = new THREE.PlaneGeometry(2.2, 1.1);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos).add(new THREE.Vector3(0, 1.2, 0));
    mesh.lookAt(this.camera.position);

    this.scene.add(mesh);
    this.popups.push({
      mesh,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 1.5, 2.5, (Math.random() - 0.5) * 1.5),
      life: 0,
      maxLife: 0.8,
    });
  }

  // Spawn particle debris (crayon dust, paper flakes)
  private spawnParticles(pos: THREE.Vector3, color: string, count = 12) {
    for (let i = 0; i < count; i++) {
      const geo = new THREE.PlaneGeometry(0.15, 0.15);
      const mat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      this.scene.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 7,
        Math.random() * 5 + 2,
        (Math.random() - 0.5) * 7
      );
      const rot = new THREE.Vector3(
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10
      );

      this.particles.push({
        mesh,
        velocity: vel,
        rotSpeed: rot,
        life: 0,
        maxLife: 0.9,
      });
    }
  }

  // Use Magic Eraser
  public triggerMagicEraser() {
    sounds.playReload();
    this.onBannerMessage?.('BORRACHA MÁGICA!', 'Apagando todos os rabiscos da tela!');

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.type !== 'boss') {
        enemy.health = 0;
        this.spawnComicPopup('APAGADO!', enemy.mesh.position, '#ec4899');
        this.spawnParticles(enemy.mesh.position, '#ffffff', 18);
        this.defeatEnemy(enemy, i);
      } else {
        enemy.health -= 350;
        this.spawnComicPopup('POW!', enemy.mesh.position, '#ec4899');
      }
    }
  }

  // Main Game Loop
  private startLoop() {
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      if (this.gameState === 'playing') {
        this.update(dt);
      }

      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    sounds.stopMusic();
  }

  // Update Game Logic
  private update(dt: number) {
    // 1. Shooting check
    if (this.isShooting) {
      this.shoot();
    }

    // 2. Rapid fire timer
    if (this.rapidFireTimer > 0) {
      this.rapidFireTimer -= dt;
    }

    // 3. Player Movement & Physics
    this.updatePlayerMovement(dt);

    // 4. Update Player Projectiles
    this.updateProjectiles(dt);

    // 5. Update Enemy Ink Projectiles
    this.updateEnemyProjectiles(dt);

    // 6. Update Enemies & Distinct Behaviors
    this.updateEnemies(dt);

    // 7. Update Particles, Popups & Powerups
    this.updateParticles(dt);
    this.updatePopups(dt);
    this.updatePowerups(dt);

    // 8. Progressive Spawning (Keep 5-10 alive, respawn from hidden corners)
    this.spawnIntervalTimer += dt;
    if (this.spawnIntervalTimer > 0.8) {
      this.spawnIntervalTimer = 0;
      if (
        this.enemies.length < this.MAX_ALIVE_ENEMIES &&
        this.enemiesSpawnedInWave < this.waveTotalEnemies
      ) {
        this.spawnNextWaveEnemy();
      }
    }

    // 9. Check Wave Complete
    if (
      this.enemies.length === 0 &&
      this.enemiesKilledInWave >= this.waveTotalEnemies &&
      this.gameState === 'playing'
    ) {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
      });
      this.startWave(this.stats.wave + 1);
    }

    // 10. Combo timer decay
    if (this.stats.comboTimer > 0) {
      this.stats.comboTimer -= dt;
      if (this.stats.comboTimer <= 0) {
        this.stats.combo = 0;
        this.onStatsChange?.(this.stats);
      }
    }

    // 11. Environment animation (sun, clouds)
    if (this.sunMesh) {
      this.sunMesh.rotation.z += 0.2 * dt;
    }
    this.clouds.forEach((c) => {
      c.position.x += 0.8 * dt;
      if (c.position.x > 40) c.position.x = -40;
    });
  }

  // Player physics and camera movement with building collision
  private updatePlayerMovement(dt: number) {
    const moveSpeed = 9.0;
    const moveVector = new THREE.Vector3();

    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    if (this.keys.KeyW) moveVector.add(forward);
    if (this.keys.KeyS) moveVector.sub(forward);
    if (this.keys.KeyD) moveVector.add(right);
    if (this.keys.KeyA) moveVector.sub(right);

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
      this.playerVel.x = moveVector.x * moveSpeed;
      this.playerVel.z = moveVector.z * moveSpeed;
      this.walkBob += dt * 11;
    } else {
      this.playerVel.x *= 0.75;
      this.playerVel.z *= 0.75;
    }

    // Jump
    if (this.keys.Space && this.isGrounded) {
      this.playerVel.y = 8.5;
      this.isGrounded = false;
      sounds.playJump();
    }

    // Gravity
    this.playerVel.y -= 22 * dt;

    // Apply movement
    const newPos = this.playerPos.clone().add(this.playerVel.clone().multiplyScalar(dt));

    // Ground collision
    if (newPos.y <= 1.7) {
      newPos.y = 1.7;
      this.playerVel.y = 0;
      this.isGrounded = true;
    }

    // Boundary arena collision
    const halfArena = this.arenaSize / 2 - 2;
    newPos.x = Math.max(-halfArena, Math.min(halfArena, newPos.x));
    newPos.z = Math.max(-halfArena, Math.min(halfArena, newPos.z));

    // Houses, Buildings & Obstacles collision
    const playerRadius = 0.55;
    this.colliders.forEach((box) => {
      const minX = box.min.x - playerRadius;
      const maxX = box.max.x + playerRadius;
      const minZ = box.min.z - playerRadius;
      const maxZ = box.max.z + playerRadius;

      if (newPos.x > minX && newPos.x < maxX && newPos.z > minZ && newPos.z < maxZ) {
        const dx1 = Math.abs(newPos.x - minX);
        const dx2 = Math.abs(newPos.x - maxX);
        const dz1 = Math.abs(newPos.z - minZ);
        const dz2 = Math.abs(newPos.z - maxZ);
        const minD = Math.min(dx1, dx2, dz1, dz2);

        if (minD === dx1) newPos.x = minX;
        else if (minD === dx2) newPos.x = maxX;
        else if (minD === dz1) newPos.z = minZ;
        else newPos.z = maxZ;
      }
    });

    this.playerPos.copy(newPos);

    // Camera walk bob
    const bobY = Math.sin(this.walkBob) * 0.05;
    const bobX = Math.cos(this.walkBob * 0.5) * 0.03;

    // Camera shake
    let shakeX = 0;
    let shakeY = 0;
    if (this.cameraShake > 0) {
      shakeX = (Math.random() - 0.5) * this.cameraShake;
      shakeY = (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake = Math.max(0, this.cameraShake - dt * 0.25);
    }

    this.camera.position.set(
      this.playerPos.x + bobX + shakeX,
      this.playerPos.y + bobY + shakeY,
      this.playerPos.z
    );

    // Set camera rotation
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // Weapon sway & recoil animation
    if (this.weaponMesh) {
      if (this.weaponRecoil > 0) {
        this.weaponRecoil = Math.max(0, this.weaponRecoil - dt * 0.85);
      }
      const recoilOffset = this.weaponRecoil * 0.2;
      this.weaponMesh.position.set(
        0.32 + Math.sin(this.walkBob) * 0.02,
        -0.28 + Math.cos(this.walkBob * 2) * 0.02 - recoilOffset,
        -0.55 + recoilOffset * 0.5
      );
      this.weaponMesh.rotation.z = Math.sin(this.walkBob) * 0.04 - this.weaponRecoil * 0.2;
    }
  }

  // Update Player Projectiles (hit checks on enemies and buildings)
  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life += dt;

      p.mesh.position.add(p.velocity.clone().multiplyScalar(dt));

      let hit = false;

      // Check hits on enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        const dist = p.mesh.position.distanceTo(enemy.mesh.position);

        if (
          dist < enemy.radius + 0.35 &&
          Math.abs(p.mesh.position.y - enemy.mesh.position.y) < enemy.height
        ) {
          hit = true;
          enemy.health -= p.damage;
          sounds.playHit();

          // Spawn particles & comic popups
          const words = ['POW!', 'POF!', 'ZAP!', 'SPLASH!', 'BAM!'];
          const word = words[Math.floor(Math.random() * words.length)];
          this.spawnComicPopup(word, p.mesh.position, p.type === 'pencil' ? '#eab308' : '#3b82f6');
          this.spawnParticles(p.mesh.position, p.type === 'pencil' ? '#fde047' : '#93c5fd', 8);

          // Enemy defeat check
          if (enemy.health <= 0) {
            this.defeatEnemy(enemy, j);
          }
          break;
        }
      }

      // Check collision against buildings / obstacles
      if (!hit) {
        for (const box of this.colliders) {
          if (box.containsPoint(p.mesh.position)) {
            hit = true;
            this.spawnParticles(p.mesh.position, '#cbd5e1', 5);
            break;
          }
        }
      }

      // Check ground collision
      if (!hit && p.mesh.position.y <= 0.1) {
        hit = true;
        this.spawnParticles(p.mesh.position, '#e2e8f0', 4);
      }

      // Remove expired or hit projectiles
      if (hit || p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  // Update Enemy Ink Projectiles
  private updateEnemyProjectiles(dt: number) {
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const p = this.enemyProjectiles[i];
      p.life += dt;
      p.mesh.position.add(p.velocity.clone().multiplyScalar(dt));
      p.mesh.lookAt(this.camera.position);

      let hit = false;

      // Check hit on player
      const distToPlayer = p.mesh.position.distanceTo(this.playerPos);
      if (distToPlayer < 1.2) {
        hit = true;
        this.damagePlayer(p.damage);
        this.spawnComicPopup('NANQUIM!', p.mesh.position, '#0f172a');
        this.spawnParticles(p.mesh.position, '#0f172a', 14);
      }

      // Check hit on buildings (buildings act as solid player cover!)
      if (!hit) {
        for (const box of this.colliders) {
          if (box.containsPoint(p.mesh.position)) {
            hit = true;
            this.spawnParticles(p.mesh.position, '#0f172a', 6);
            break;
          }
        }
      }

      // Ground hit
      if (!hit && p.mesh.position.y <= 0.1) {
        hit = true;
        this.spawnParticles(p.mesh.position, '#0f172a', 5);
      }

      if (hit || p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        this.enemyProjectiles.splice(i, 1);
      }
    }
  }

  // Handle enemy defeat
  private defeatEnemy(enemy: EnemyEntity, index: number) {
    sounds.playEnemyDefeated();
    this.scene.remove(enemy.mesh);
    this.enemies.splice(index, 1);

    // Confetti & doodle burst
    this.spawnComicPopup('K.O.!', enemy.mesh.position, '#10b981');
    this.spawnParticles(enemy.mesh.position, '#f43f5e', 24);

    // Stats
    this.stats.kills++;
    this.stats.combo++;
    this.stats.comboTimer = 4.0;
    const scoreGain = enemy.scoreValue * Math.min(5, this.stats.combo);
    this.stats.score += scoreGain;

    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      localStorage.setItem('doodle_shooter_highscore', this.stats.highScore.toString());
    }

    this.enemiesKilledInWave++;
    this.stats.enemiesAlive = this.enemies.length;
    this.stats.enemiesRemainingInWave = Math.max(
      0,
      this.waveTotalEnemies - this.enemiesKilledInWave
    );
    this.onStatsChange?.(this.stats);

    // Drop ammo or health powerups!
    const dropRoll = Math.random();
    if (dropRoll < 0.35) {
      // Ammo box for one of the weapons
      const ammoTypes: Array<'ammo_pistol' | 'ammo_shotgun' | 'ammo_rifle' | 'ammo_all'> = [
        'ammo_pistol',
        'ammo_shotgun',
        'ammo_rifle',
      ];
      const pickedAmmo = ammoTypes[Math.floor(Math.random() * ammoTypes.length)];
      this.spawnPowerup(pickedAmmo, enemy.mesh.position);
    } else if (dropRoll < 0.5) {
      this.spawnPowerup('health', enemy.mesh.position);
    }
  }

  // Update Enemies with Distinct Movement & Attack Patterns
  private updateEnemies(dt: number) {
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];

      // Billboard: face player camera
      enemy.mesh.lookAt(this.camera.position.x, enemy.mesh.position.y, this.camera.position.z);

      // "Boiling lines" animation flipbook (2 frames jitter)
      enemy.frameTimer += dt;
      if (enemy.frameTimer > 0.18) {
        enemy.frameTimer = 0;
        enemy.frame = (enemy.frame + 1) % enemy.textures.length;
        (enemy.mesh.material as THREE.MeshBasicMaterial).map = enemy.textures[enemy.frame];
      }

      // Distance and direction to player
      const toPlayer = this.playerPos.clone().sub(enemy.mesh.position);
      toPlayer.y = 0;
      const dist = toPlayer.length();
      const normDir = toPlayer.clone().normalize();

      // DISTINCT BEHAVIORS:
      if (enemy.type === 'dino') {
        // 1. DINO (Rusher): Fast charge with sinusoidal zigzag dodging!
        enemy.hopTime += dt * 9;
        const hopY = Math.abs(Math.sin(enemy.hopTime)) * 0.35;
        enemy.mesh.position.y = enemy.height / 2 + hopY;

        // Zigzag side vector
        const sideVec = new THREE.Vector3(-normDir.z, 0, normDir.x);
        const zigzag = Math.sin(enemy.hopTime * 2.2) * 1.5;

        const moveStep = normDir.clone().multiplyScalar(enemy.speed * dt);
        moveStep.add(sideVec.multiplyScalar(zigzag * dt));
        enemy.mesh.position.add(moveStep);

        // Melee attack
        if (dist < 1.6) {
          enemy.attackCooldown -= dt;
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 0.8;
            this.damagePlayer(enemy.damage);
            this.spawnComicPopup('NHAC!', this.playerPos, '#ef4444');
          }
        }
      } else if (enemy.type === 'atirador') {
        // 2. ATIRADOR (Ranged Origami Bird): Keeps distance (14-20m), strafes side to side, and shoots ink!
        enemy.hopTime += dt * 6;
        const flyY = Math.sin(enemy.hopTime) * 0.4;
        enemy.mesh.position.y = enemy.height / 2 + 1.2 + flyY;

        // Strafe timer
        enemy.strafeTimer -= dt;
        if (enemy.strafeTimer <= 0) {
          enemy.strafeTimer = 1.5 + Math.random() * 2.0;
          enemy.strafeDir *= -1;
        }

        const sideVec = new THREE.Vector3(-normDir.z, 0, normDir.x);
        const moveStep = new THREE.Vector3();

        // Distance control
        if (dist > 20) {
          // Advance closer
          moveStep.add(normDir.clone().multiplyScalar(enemy.speed * dt));
        } else if (dist < 12) {
          // Back off
          moveStep.sub(normDir.clone().multiplyScalar(enemy.speed * 0.9 * dt));
        }

        // Lateral strafe
        moveStep.add(sideVec.multiplyScalar(enemy.speed * 0.8 * enemy.strafeDir * dt));
        enemy.mesh.position.add(moveStep);

        // Shoot ink projectile at player
        enemy.shootCooldown -= dt;
        if (enemy.shootCooldown <= 0 && dist < 26) {
          enemy.shootCooldown = 2.2 + Math.random() * 0.8;
          this.createEnemyInkProjectile(enemy.mesh.position, this.playerPos, enemy.damage);
        }
      } else if (enemy.type === 'robo') {
        // 3. ROBO (Heavy Melee Tank): Steady heavy march, massive HP, heavy ground slam
        enemy.hopTime += dt * 4;
        const walkY = Math.abs(Math.sin(enemy.hopTime)) * 0.15;
        enemy.mesh.position.y = enemy.height / 2 + walkY;

        if (dist > 1.8) {
          enemy.mesh.position.add(normDir.clone().multiplyScalar(enemy.speed * dt));
        } else {
          // Melee Heavy Punch
          enemy.attackCooldown -= dt;
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 1.4;
            this.damagePlayer(enemy.damage);
            this.cameraShake = 0.35; // Heavy punch shakes camera!
            this.spawnComicPopup('CRASH!', this.playerPos, '#ca8a04');
          }
        }
      } else if (enemy.type === 'zoio') {
        // 4. ZOIO (Erratic Jumper): High parabolic jumps in the air towards the player!
        enemy.hopTime += dt * 8;
        const hopY = Math.abs(Math.sin(enemy.hopTime)) * 0.9;
        enemy.mesh.position.y = enemy.height / 2 + hopY;

        if (dist > 1.3) {
          enemy.mesh.position.add(normDir.clone().multiplyScalar(enemy.speed * dt));
        } else {
          enemy.attackCooldown -= dt;
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 0.9;
            this.damagePlayer(enemy.damage);
          }
        }
      } else if (enemy.type === 'boss') {
        // 5. BOSS (Chefe Rabisco): Giant boss that marches and alternates shockwave stomps & ink spreads!
        enemy.hopTime += dt * 4;
        const bossY = Math.abs(Math.sin(enemy.hopTime)) * 0.3;
        enemy.mesh.position.y = enemy.height / 2 + bossY;

        if (dist > 3.0) {
          enemy.mesh.position.add(normDir.clone().multiplyScalar(enemy.speed * dt));
        } else {
          // Stomp melee
          enemy.attackCooldown -= dt;
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 1.6;
            this.damagePlayer(enemy.damage);
            this.cameraShake = 0.45;
            this.spawnComicPopup('PISÃO!', this.playerPos, '#ef4444');
          }
        }

        // Ink spread volley every ~3 seconds
        enemy.shootCooldown -= dt;
        if (enemy.shootCooldown <= 0) {
          enemy.shootCooldown = 3.2;
          // Shoot 3 ink projectiles in a fan!
          const spreadAngles = [-0.25, 0, 0.25];
          spreadAngles.forEach((ang) => {
            const target = this.playerPos.clone();
            target.x += ang * 8;
            target.z += ang * 8;
            this.createEnemyInkProjectile(enemy.mesh.position, target, 18);
          });
          this.spawnComicPopup('TEMPESTADE!', enemy.mesh.position, '#b91c1c');
        }
      }

      // Push back enemy if inside building colliders
      this.colliders.forEach((box) => {
        if (box.containsPoint(enemy.mesh.position)) {
          // Push slightly toward player
          enemy.mesh.position.add(normDir.clone().multiplyScalar(0.4));
        }
      });
    }
  }

  // Player damaged
  private damagePlayer(amount: number) {
    this.stats.health = Math.max(0, this.stats.health - amount);
    this.cameraShake = 0.22;
    sounds.playPlayerHurt();
    this.onStatsChange?.(this.stats);

    if (this.stats.health <= 0) {
      this.gameOver();
    }
  }

  // Game Over
  private gameOver() {
    this.gameState = 'gameover';
    this.onGameStateChange?.('gameover');
    sounds.stopMusic();
    if (document.pointerLockElement === this.container) {
      document.exitPointerLock();
    }
  }

  // Update Particles
  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;

      p.velocity.y -= 14 * dt; // Gravity
      p.mesh.position.add(p.velocity.clone().multiplyScalar(dt));
      p.mesh.rotation.x += p.rotSpeed.x * dt;
      p.mesh.rotation.y += p.rotSpeed.y * dt;

      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  // Update Comic Popups
  private updatePopups(dt: number) {
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.life += dt;

      pop.mesh.position.add(pop.velocity.clone().multiplyScalar(dt));
      pop.mesh.lookAt(this.camera.position);

      const progress = pop.life / pop.maxLife;
      (pop.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - progress;

      if (pop.life >= pop.maxLife) {
        this.scene.remove(pop.mesh);
        this.popups.splice(i, 1);
      }
    }
  }

  // Update Powerups (collection of ammo, health, magic eraser)
  private updatePowerups(dt: number) {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pw = this.powerups[i];
      pw.mesh.rotation.y += pw.rotSpeed * dt;
      pw.mesh.position.y = 1.0 + Math.sin(performance.now() * 0.004) * 0.2;

      const dist = pw.mesh.position.distanceTo(this.playerPos);
      if (dist < 2.0) {
        sounds.playPowerup();

        if (pw.type === 'health') {
          this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + 35);
          this.spawnComicPopup('+35 VIDA', pw.mesh.position, '#ef4444');
        } else if (pw.type === 'ammo_pistol') {
          this.weapons.pistol.reserveAmmo = Math.min(
            this.weapons.pistol.maxReserveAmmo,
            this.weapons.pistol.reserveAmmo + 24
          );
          sounds.playAmmoPickup();
          this.spawnComicPopup('+24 CLIPS', pw.mesh.position, '#38bdf8');
        } else if (pw.type === 'ammo_shotgun') {
          this.weapons.shotgun.reserveAmmo = Math.min(
            this.weapons.shotgun.maxReserveAmmo,
            this.weapons.shotgun.reserveAmmo + 12
          );
          sounds.playAmmoPickup();
          this.spawnComicPopup('+12 GIZ', pw.mesh.position, '#ef4444');
        } else if (pw.type === 'ammo_rifle') {
          this.weapons.rifle.reserveAmmo = Math.min(
            this.weapons.rifle.maxReserveAmmo,
            this.weapons.rifle.reserveAmmo + 45
          );
          sounds.playAmmoPickup();
          this.spawnComicPopup('+45 HB', pw.mesh.position, '#eab308');
        } else if (pw.type === 'ammo_all') {
          this.weapons.pistol.reserveAmmo = Math.min(
            this.weapons.pistol.maxReserveAmmo,
            this.weapons.pistol.reserveAmmo + 36
          );
          this.weapons.shotgun.reserveAmmo = Math.min(
            this.weapons.shotgun.maxReserveAmmo,
            this.weapons.shotgun.reserveAmmo + 18
          );
          this.weapons.rifle.reserveAmmo = Math.min(
            this.weapons.rifle.maxReserveAmmo,
            this.weapons.rifle.reserveAmmo + 60
          );
          sounds.playAmmoPickup();
          this.spawnComicPopup('+MUNIÇÃO TOTAL!', pw.mesh.position, '#10b981');
        } else if (pw.type === 'eraser') {
          this.triggerMagicEraser();
        } else if (pw.type === 'gold') {
          this.rapidFireTimer = 10;
          this.spawnComicPopup('SUPER VELOCIDADE!', pw.mesh.position, '#eab308');
        }

        this.onStatsChange?.(this.stats);
        this.onWeaponChange?.(this.weapons[this.currentWeaponType]);

        this.scene.remove(pw.mesh);
        this.powerups.splice(i, 1);
      }
    }
  }

  // Render
  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  // Cleanup
  public dispose() {
    this.stopLoop();
    window.removeEventListener('resize', this.onWindowResize);
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
  }
}
