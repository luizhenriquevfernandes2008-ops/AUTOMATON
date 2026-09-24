// Leitura dos GLBs reais no Node: apenas a decodificação de imagens é substituída.
import { readFile } from 'node:fs/promises';
import { SourceTextModule, createContext } from 'node:vm';

export const context = createContext({ console, TextDecoder, ArrayBuffer, Uint8Array, URL,
  setTimeout, clearTimeout, addEventListener() {} });
export const modules = new Map();
export async function loadModule(url) {
  url = String(url);
  if (modules.has(url)) return modules.get(url);
  const mod = new SourceTextModule(await readFile(new URL(url), 'utf8'), { context, identifier: url });
  modules.set(url, mod);
  await mod.link((specifier) => loadModule(specifier === 'three'
    ? new URL('../lib/three.module.js', import.meta.url)
    : specifier.startsWith('three/addons/') ? new URL('../lib/addons/' + specifier.slice(13), import.meta.url)
      : new URL(specifier, url)));
  return mod;
}
const loaderModule = await loadModule(new URL('../lib/addons/loaders/GLTFLoader.js', import.meta.url));
await loaderModule.evaluate();
export const THREE = modules.get(String(new URL('../lib/three.module.js', import.meta.url))).namespace;
export async function readGLTF(path) {
  const bytes = await readFile(new URL(path, import.meta.url));
  const loader = new loaderModule.namespace.GLTFLoader();
  loader.register(() => ({ name: 'test-textures', loadTexture: async () => new THREE.Texture() }));
  return loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
}
