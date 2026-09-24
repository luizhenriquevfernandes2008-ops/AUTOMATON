// Ciclo de dia e noite, clima (chuva leve), estrelas e postes de luz.
import * as THREE from 'three';
import { game } from './state.js';
import { cloneModel } from './assets.js';
import { audio } from './audio.js';

export const DAY_LENGTH = 16 * 60; // segundos por dia completo
const rainAudio = new Audio('assets/sounds/rain_loop.mp3');
rainAudio.loop = true;
rainAudio.volume = 0;

let stars, rain, rainPos, rainVel, lamps = [];
const sky = {
  t: 0.3,           // 0 = meia-noite, 0.25 = amanhecer, 0.5 = meio-dia, 0.75 = anoitecer
  weather: 'limpo', // limpo | nublado | chuva
  weatherT: 240,
  rainK: 0,         // 0..1 intensidade visual da chuva
  cloudK: 0,
  frozen: false,
};
game.sky = sky;

export function initSky() {
  // estrelas
  const n = 1400;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2;
    const r = 380, s = Math.sqrt(1 - u * u);
    pos[i * 3] = r * s * Math.cos(th);
    pos[i * 3 + 1] = Math.abs(r * u) * 0.9 + 20;
    pos[i * 3 + 2] = r * s * Math.sin(th);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  stars.renderOrder = -1;
  game.scene.add(stars);

  // chuva: riscos finos em volta da câmera
  const drops = 1500;
  rainPos = new Float32Array(drops * 6);
  rainVel = new Float32Array(drops);
  for (let i = 0; i < drops; i++) resetDrop(i, true);
  const rg = new THREE.BufferGeometry();
  rg.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xaec4dd, transparent: true, opacity: 0, depthWrite: false }));
  rain.frustumCulled = false;
  game.scene.add(rain);

  // postes de luz em volta do piso da fábrica
  const spots = [[-19, -19], [19, -19], [-19, 19], [19, 19], [0, -19.5], [-19.5, 0], [19.5, 0], [-6, 21], [6, 21]];
  for (const [x, z] of spots) {
    const m = cloneModel('d_lamp');
    m.scale.setScalar(1.7);
    m.position.set(x, 0, z);
    game.scene.add(m);
    const l = new THREE.PointLight(0xffc98a, 0, 16, 1.4);
    l.position.set(x, 3, z);
    game.scene.add(l);
    lamps.push(l);
  }
}

function resetDrop(i, anywhere) {
  const c = game.camera?.position || { x: 0, y: 0, z: 0 };
  const x = c.x + (Math.random() - 0.5) * 50, z = c.z + (Math.random() - 0.5) * 50;
  const y = anywhere ? Math.random() * 30 : 25 + Math.random() * 8;
  rainPos.set([x, y, z, x + 0.05, y - 0.7, z], i * 6);
  rainVel[i] = 18 + Math.random() * 6;
}

const cSunDay = new THREE.Color(0xfff0d8), cSunGold = new THREE.Color(0xffb070), cMoon = new THREE.Color(0x9fb8ff);
const fogDay = new THREE.Color(0xcfd9e6), fogDusk = new THREE.Color(0xe0a88a), fogNight = new THREE.Color(0x0f1726), fogRain = new THREE.Color(0x8a96a6);
const hemiDaySky = new THREE.Color(0xcfe3ff), hemiNightSky = new THREE.Color(0x3a4a78);
const tmp = new THREE.Color();

export function updateSky(dt, simulate) {
  if (simulate && !sky.frozen) sky.t = (sky.t + dt / DAY_LENGTH) % 1;
  // clima
  if (simulate) {
    sky.weatherT -= dt;
    if (sky.weatherT <= 0) {
      const r = Math.random();
      if (sky.weather === 'chuva') { sky.weather = r < 0.5 ? 'nublado' : 'limpo'; sky.weatherT = 240 + Math.random() * 360; }
      else if (sky.weather === 'nublado') { sky.weather = r < 0.55 + 0.07 * (game.economy?.satLvl('clima') || 0) ? 'chuva' : 'limpo'; sky.weatherT = sky.weather === 'chuva' ? 100 + Math.random() * 120 : 200 + Math.random() * 300; }
      else { sky.weather = r < 0.5 ? 'nublado' : 'limpo'; sky.weatherT = 200 + Math.random() * 300; }
      game.emit('weather', sky.weather);
    }
  }
  const wantRain = sky.weather === 'chuva' ? 1 : 0;
  const wantCloud = sky.weather === 'limpo' ? 0 : 1;
  sky.rainK += (wantRain - sky.rainK) * Math.min(1, dt * 0.25);
  sky.cloudK += (wantCloud - sky.cloudK) * Math.min(1, dt * 0.2);

  // sol: altura pelo horário
  const ang = (sky.t - 0.25) * Math.PI * 2; // 0 no amanhecer, PI/2 no meio-dia
  const elev = Math.sin(ang);               // -1..1
  const day = THREE.MathUtils.smoothstep(elev, -0.12, 0.18); // 0 noite, 1 dia
  const golden = Math.max(0, 1 - Math.abs(elev) / 0.3) * day;
  game.sunLight = Math.max(0, Math.min(1, elev * 1.6)) * (1 - sky.cloudK * 0.35);
  game.weatherPower = 1 - sky.rainK * 0.55;
  game.isNight = day < 0.25;
  const scene = game.scene, sun = game.sun, hemi = game.hemi;
  // direção do sol (de dia) ou da lua (de noite)
  const dir = new THREE.Vector3(Math.cos(ang) * 0.8, Math.max(0.25, Math.abs(elev)), 0.45).normalize();
  game.sunDir = dir;
  if (sun) {
    tmp.copy(cSunDay).lerp(cSunGold, golden);
    sun.color.copy(day > 0.05 ? tmp : cMoon);
    sun.intensity = (day > 0.05 ? 0.3 + 2.3 * day : 0.35) * (1 - sky.cloudK * 0.45);
  }
  if (hemi) {
    hemi.color.copy(hemiNightSky).lerp(hemiDaySky, day);
    hemi.intensity = 0.25 + 0.5 * day;
  }
  scene.environmentIntensity = 0.12 + 0.45 * day * (1 - sky.cloudK * 0.3);
  scene.backgroundIntensity = 0.06 + 0.9 * day * (1 - sky.cloudK * 0.35);
  if (scene.fog) {
    tmp.copy(fogNight).lerp(fogDay, day).lerp(fogDusk, golden * 0.5).lerp(fogRain, sky.rainK * 0.6 * Math.max(0.3, day));
    scene.fog.color.copy(tmp);
    scene.fog.near = 70 - sky.rainK * 45;
    scene.fog.far = 260 - sky.rainK * 150;
  }
  game.renderer.toneMappingExposure = 1.0 + (1 - day) * 0.25;
  if (stars) {
    stars.material.opacity = Math.max(0, (1 - day) * (1 - sky.cloudK * 0.8)) * 0.9;
    stars.position.copy(game.camera.position);
  }
  const lampOn = day < 0.45 || sky.rainK > 0.6;
  for (const l of lamps) l.intensity += ((lampOn ? 9 : 0) - l.intensity) * Math.min(1, dt * 2);
  // chuva
  if (rain) {
    rain.material.opacity = sky.rainK * 0.55;
    rain.visible = sky.rainK > 0.02;
    if (rain.visible) {
      const c = game.camera.position;
      const n = rainVel.length;
      for (let i = 0; i < n; i++) {
        const o = i * 6;
        const dy = rainVel[i] * dt;
        rainPos[o + 1] -= dy; rainPos[o + 4] -= dy;
        rainPos[o] -= dy * 0.07; rainPos[o + 3] -= dy * 0.07;
        if (rainPos[o + 1] < 0 || Math.abs(rainPos[o] - c.x) > 26 || Math.abs(rainPos[o + 2] - c.z) > 26) resetDrop(i, false);
      }
      rain.geometry.attributes.position.needsUpdate = true;
    }
  }
  const vol = sky.rainK * audio.settings.ambience * 1.2;
  if (vol > 0.01) { rainAudio.volume = Math.min(1, vol); if (rainAudio.paused && audio.started) rainAudio.play().catch(() => { }); }
  else if (!rainAudio.paused) rainAudio.pause();
  // conquistas
  if (game.mode === 'play' && game.economy) {
    if (game.isNight) game.economy.stats.nightSeen = true;
    if (sky.rainK > 0.7) game.economy.stats.rainSeen = true;
  }
}

export function clockText() {
  const mins = Math.floor(sky.t * 24 * 60);
  const h = Math.floor(mins / 60), m = mins % 60;
  const icon = sky.weather === 'chuva' ? '🌧️' : sky.weather === 'nublado' ? '⛅' : game.isNight ? '🌙' : '☀️';
  return `${icon} ${String(h).padStart(2, '0')}:${String(m - (m % 10)).padStart(2, '0')}`;
}
export function serializeSky() { return { t: sky.t, weather: sky.weather, weatherT: sky.weatherT }; }
export function loadSky(d) { if (!d) return; sky.t = d.t ?? sky.t; sky.weather = d.weather || 'limpo'; sky.weatherT = d.weatherT || 240; sky.rainK = sky.weather === 'chuva' ? 1 : 0; sky.cloudK = sky.weather === 'limpo' ? 0 : 1; }
