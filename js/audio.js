// Som: efeitos (Kenney, CC0), ambiente da floresta (OpenGameArt, CC0) e músicas (Kevin MacLeod, CC-BY).

export const TRACKS = [
  { file: 'lobby_time.mp3', nome: 'Lobby Time' },
  { file: 'airport_lounge.mp3', nome: 'Airport Lounge' },
  { file: 'wallpaper.mp3', nome: 'Wallpaper' },
  { file: 'local_forecast_elevator.mp3', nome: 'Local Forecast - Elevator' },
  { file: 'bossa_antigua.mp3', nome: 'Bossa Antigua' },
  { file: 'deliberate_thought.mp3', nome: 'Deliberate Thought' },
  { file: 'dreamer.mp3', nome: 'Dreamer' },
  { file: 'easy_lemon.mp3', nome: 'Easy Lemon' },
  { file: 'carefree.mp3', nome: 'Carefree' },
  { file: 'laid_back_guitars.mp3', nome: 'Laid Back Guitars' },
];

const SFX = {
  stepConcrete: ['footstep_concrete_000', 'footstep_concrete_001', 'footstep_concrete_002', 'footstep_concrete_003', 'footstep_concrete_004'],
  stepGrass: ['footstep_grass_000', 'footstep_grass_001', 'footstep_grass_002', 'footstep_grass_003', 'footstep_grass_004'],
  place: ['impactMetal_light_000', 'impactMetal_light_001'],
  remove: ['impactPlate_light_000', 'impactPlate_light_001'],
  mine: ['impactMining_000', 'impactMining_001', 'impactMining_002'],
  smelt: ['forceField_000'],
  assemble: ['impactTin_medium_000'],
  sell: ['glass_002'],
  coins: ['confirmation_002'],
  levelup: ['maximize_006'],
  click: ['click_001', 'click_002'],
  select: ['select_001', 'select_002'],
  open: ['open_001'],
  close: ['close_001'],
  error: ['error_004'],
  run: ['confirmation_001'],
  stop: ['toggle_001'],
  tick: ['tick_001'],
  beep: ['pluck_001', 'pluck_002'],
  drop: ['drop_002'],
  buy: ['confirmation_004'],
  deny: ['error_006'],
  sorter: ['switch_002'],
  quest: ['bong_001'],
  computer: ['computerNoise_000', 'computerNoise_001'],
  jump: ['impactSoft_medium_000'],
  coffee: ['question_001'],
};

class AudioManager {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.settings = { music: 0.45, sfx: 0.7, ambience: 0.35 };
    this.trackIndex = Math.floor(Math.random() * TRACKS.length);
    this.music = new Audio();
    this.music.preload = 'auto';
    this.music.addEventListener('ended', () => this.nextTrack());
    this.ambience = new Audio('assets/sounds/forest_ambience.mp3');
    this.ambience.loop = true;
    this.listener = { pos: { x: 0, y: 0, z: 0 }, right: { x: 1, z: 0 } };
    this.onTrackChange = null;
    this.musicOn = true;
    this.started = false;
  }

  async load() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    const names = new Set(Object.values(SFX).flat());
    await Promise.all([...names].map(async (n) => {
      try {
        const res = await fetch('assets/sounds/' + n + '.ogg');
        const arr = await res.arrayBuffer();
        this.buffers[n] = await this.ctx.decodeAudioData(arr);
      } catch (e) { console.warn('som falhou', n, e); }
    }));
  }

  start() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    if (this.started) return;
    this.started = true;
    this.ambience.volume = this.settings.ambience;
    this.ambience.play().catch(() => { });
    if (this.musicOn) this.playTrack(this.trackIndex);
  }

  playTrack(i) {
    this.trackIndex = (i + TRACKS.length) % TRACKS.length;
    const t = TRACKS[this.trackIndex];
    this.music.src = 'assets/music/' + t.file;
    this.music.volume = this.settings.music;
    if (this.musicOn) this.music.play().catch(() => { });
    this.onTrackChange && this.onTrackChange(t);
    this.onTrackChangeMenu && this.onTrackChangeMenu(t);
  }
  nextTrack() { this.playTrack(this.trackIndex + 1); }
  prevTrack() { this.playTrack(this.trackIndex - 1); }
  toggleMusic() {
    this.musicOn = !this.musicOn;
    if (this.musicOn) { if (!this.music.src) this.playTrack(this.trackIndex); else this.music.play().catch(() => { }); }
    else this.music.pause();
    return this.musicOn;
  }
  currentTrack() { return TRACKS[this.trackIndex]; }

  setVolume(kind, v) {
    this.settings[kind] = v;
    if (kind === 'music') this.music.volume = v;
    if (kind === 'ambience') this.ambience.volume = v;
  }

  setListener(pos, rightX, rightZ) {
    this.listener.pos = pos;
    this.listener.right = { x: rightX, z: rightZ };
  }

  // toca um efeito. pos opcional => volume/pan pela distância
  play(name, opts = {}) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const list = SFX[name];
    if (!list) return;
    const buf = this.buffers[list[Math.floor(Math.random() * list.length)]];
    if (!buf) return;
    let vol = (opts.volume ?? 1) * this.settings.sfx;
    let pan = 0;
    if (opts.pos) {
      const dx = opts.pos.x - this.listener.pos.x, dz = opts.pos.z - this.listener.pos.z;
      const d = Math.hypot(dx, dz);
      const maxD = opts.range ?? 22;
      if (d > maxD) return;
      vol *= Math.pow(1 - d / maxD, 1.6);
      if (d > 0.5) pan = Math.max(-1, Math.min(1, (dx * this.listener.right.x + dz * this.listener.right.z) / d)) * 0.7;
    }
    if (vol < 0.01) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = opts.rate ?? (0.94 + Math.random() * 0.12);
    const g = this.ctx.createGain();
    g.gain.value = vol;
    const p = this.ctx.createStereoPanner();
    p.pan.value = pan;
    src.connect(g).connect(p).connect(this.master);
    src.start();
  }
}

export const audio = new AudioManager();
