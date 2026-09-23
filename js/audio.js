// Som: efeitos (Kenney, CC0), ambiente da floresta (OpenGameArt, CC0) e músicas (Kevin MacLeod, CC-BY).

const T = (file, nome, autor = 'Kevin MacLeod') => ({ file, nome, autor });
// Estações do rádio. Bossa é a padrão :)
export const STATIONS = [
  {
    id: 'bossa', nome: 'Bossa FM', icone: '🌴', tracks: [
      T('bossa_antigua.mp3', 'Bossa Antigua'), T('casa_bossa_nova.mp3', 'Casa Bossa Nova'), T('bossabossa.mp3', 'BossaBossa'),
      T('samba_isobel.mp3', 'Samba Isobel'), T('cool_vibes.mp3', 'Cool Vibes'), T('sidewalk_shade.mp3', 'Sidewalk Shade'),
      T('latin_industries.mp3', 'Latin Industries'), T('bossa_town.mp3', 'Bossa Town', 'KarateStudios'),
      T('bossa_shop.mp3', 'Bossa Shop Theme', 'SpringySpringo'), T('bossa_nova_8bit.mp3', 'Bossa Nova (8-bit)', 'Joth'),
      T('airport_lounge.mp3', 'Airport Lounge'),
    ],
  },
  {
    id: 'lofi', nome: 'Lo-fi Chill', icone: '☁️', tracks: [
      T('lobby_time.mp3', 'Lobby Time'), T('wallpaper.mp3', 'Wallpaper'), T('dreamer.mp3', 'Dreamer'),
      T('deliberate_thought.mp3', 'Deliberate Thought'), T('carefree.mp3', 'Carefree'), T('easy_lemon.mp3', 'Easy Lemon'),
    ],
  },
  {
    id: 'jazz', nome: 'Jazz Lounge', icone: '🎷', tracks: [
      T('jazz_brunch.mp3', 'Jazz Brunch'), T('smooth_lovin.mp3', 'Smooth Lovin'), T('hep_cats.mp3', 'Hep Cats'),
      T('bass_walker.mp3', 'Bass Walker'), T('george_street_shuffle.mp3', 'George Street Shuffle'),
      T('local_forecast_elevator.mp3', 'Local Forecast - Elevator'), T('laid_back_guitars.mp3', 'Laid Back Guitars'),
    ],
  },
  { id: 'natureza', nome: 'Só Natureza', icone: '🌿', tracks: [] },
];
export const TRACKS = STATIONS.flatMap((s) => s.tracks);
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
  question: ['question_001'],
  back: ['back_001'],
  launch: ['spaceEngineLarge_000'],
  thruster: ['thrusterFire_000'],
  achievement: ['maximize_008'],
  photo: ['laserRetro_000'],
};

class AudioManager {
  constructor() {
    this.ctx = null;
    this.buffers = {};
    this.settings = { music: 0.45, sfx: 0.7, ambience: 0.35 };
    this.station = 0;
    this.trackIndex = Math.floor(Math.random() * STATIONS[0].tracks.length);
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

  get stationObj() { return STATIONS[this.station]; }
  playTrack(i) {
    const list = this.stationObj.tracks;
    if (!list.length) { // estação só de natureza
      this.music.pause();
      this.music.removeAttribute('src');
      const t = { nome: 'sons da natureza', file: null };
      this.onTrackChange && this.onTrackChange(t);
      this.onTrackChangeMenu && this.onTrackChangeMenu(t);
      return;
    }
    this.trackIndex = (i + list.length) % list.length;
    const t = list[this.trackIndex];
    this.music.src = 'assets/music/' + t.file;
    this.music.volume = this.settings.music;
    if (this.musicOn) this.music.play().catch(() => { });
    this.onTrackChange && this.onTrackChange(t);
    this.onTrackChangeMenu && this.onTrackChangeMenu(t);
  }
  setStation(i) {
    this.station = (i + STATIONS.length) % STATIONS.length;
    this.trackIndex = Math.floor(Math.random() * Math.max(1, this.stationObj.tracks.length));
    if (this.started) this.playTrack(this.trackIndex);
    return this.stationObj;
  }
  nextStation() { return this.setStation(this.station + 1); }
  nextTrack() { this.playTrack(this.trackIndex + 1); }
  prevTrack() { this.playTrack(this.trackIndex - 1); }
  toggleMusic() {
    this.musicOn = !this.musicOn;
    if (this.musicOn) { if (!this.music.src) this.playTrack(this.trackIndex); else this.music.play().catch(() => { }); }
    else this.music.pause();
    return this.musicOn;
  }
  currentTrack() { return this.stationObj.tracks[this.trackIndex] || { nome: 'sons da natureza' }; }

  // nota musical sintetizada (alto-falante programável)
  note(freq, dur, pos) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    let vol = 0.35 * this.settings.sfx, pan = 0;
    if (pos) {
      const dx = pos.x - this.listener.pos.x, dz = pos.z - this.listener.pos.z;
      const d = Math.hypot(dx, dz);
      if (d > 35) return;
      vol *= Math.pow(1 - d / 35, 1.4);
      if (d > 0.5) pan = Math.max(-1, Math.min(1, (dx * this.listener.right.x + dz * this.listener.right.z) / d)) * 0.7;
    }
    const t0 = this.ctx.currentTime;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur + 0.35);
    const p = this.ctx.createStereoPanner();
    p.pan.value = pan;
    g.connect(p).connect(this.master);
    // timbre de marimba: fundamental + harmônico suave
    for (const [mul, type, amp] of [[1, 'triangle', 1], [4, 'sine', 0.18], [2, 'sine', 0.25]]) {
      const o = this.ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq * mul;
      const og = this.ctx.createGain();
      og.gain.value = amp;
      o.connect(og).connect(g);
      o.start(t0);
      o.stop(t0 + dur + 0.4);
    }
  }
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
