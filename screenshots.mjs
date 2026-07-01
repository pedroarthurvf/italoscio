// =====================================================================
// screenshots.mjs — verificação visual desktop + mobile
//
// Uso:
//   1. Suba o servidor estático:  python3 -m http.server 3000
//   2. Rode:                      node screenshots.mjs
//   3. Revise os PNGs em:         screenshots/
//
// O Puppeteer NÃO é instalado neste projeto (mantém "zero dependências").
// Este script reaproveita uma instalação já existente no disco: tenta
// resolver o pacote `puppeteer` normalmente e, como fallback, procura em
// ~/Desktop/Projects/*/node_modules/puppeteer (o Chrome fica em
// ~/.cache/puppeteer, gerenciado pelo próprio Puppeteer).
// =====================================================================

import { createRequire } from 'node:module';
import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

const URL = process.env.URL || 'http://localhost:3000/index.html';
const OUT = path.join(process.cwd(), 'screenshots');

// ---- Resolve o Puppeteer instalado no disco --------------------------
async function loadPuppeteer() {
  const require = createRequire(import.meta.url);
  try {
    return require('puppeteer');
  } catch {}
  // Fallback: puppeteer é CommonJS — require() no diretório do pacote
  // resolve o "main" via package.json.
  const projectsDir = path.join(homedir(), 'Desktop', 'Projects');
  if (existsSync(projectsDir)) {
    for (const dir of readdirSync(projectsDir)) {
      const candidate = path.join(projectsDir, dir, 'node_modules', 'puppeteer');
      if (existsSync(candidate)) {
        const mod = require(candidate);
        return mod.default || mod;
      }
    }
  }
  throw new Error('Puppeteer não encontrado no disco. Instale-o em algum projeto ou globalmente.');
}

// ---- Configuração das capturas --------------------------------------
const viewports = [
  { name: 'desktop', width: 1440, height: 900, dsf: 1 },
  { name: 'mobile', width: 390, height: 844, dsf: 2 },
];

// Seções-chave capturadas por elemento (além do full-page)
const sections = ['#casos', '#agendar', '#contato'];

async function run() {
  const puppeteer = await loadPuppeteer();
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    for (const vp of viewports) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.dsf });
      await page.goto(URL, { waitUntil: 'networkidle0' });

      // Força as animações de entrada (.reveal / [data-hero]) para o estado
      // visível — senão as seções saem em opacity:0 no screenshot.
      await page.evaluate(() => {
        document.querySelectorAll('.reveal, [data-hero]')
          .forEach((el) => el.classList.add('is-visible'));
      });
      await new Promise((r) => setTimeout(r, 300));

      // Header (topo da página)
      const header = await page.$('.header');
      if (header) await header.screenshot({ path: path.join(OUT, `${vp.name}-header.png`) });

      // Página inteira
      await page.screenshot({ path: path.join(OUT, `${vp.name}-full.png`), fullPage: true });

      // Seções-chave por elemento
      for (const sel of sections) {
        const el = await page.$(sel);
        if (!el) continue;
        await el.scrollIntoView();
        await new Promise((r) => setTimeout(r, 250));
        await el.screenshot({ path: path.join(OUT, `${vp.name}-${sel.replace('#', '')}.png`) });
      }

      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log(`Screenshots salvos em ${OUT}`);
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
