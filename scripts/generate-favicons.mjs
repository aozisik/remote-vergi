#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';

const exec = promisify(execFile);
const SVG = 'public/favicon.svg';

// Sizes to generate as standalone PNGs.
const PNG_SIZES = [
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

async function renderPng({ name, size }) {
  const buffer = await sharp(SVG, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const path = `public/${name}`;
  await fs.writeFile(path, buffer);
  return path;
}

async function buildIco() {
  // Combine 16/32/48 PNGs into one .ico via ImageMagick.
  const ico = 'public/favicon.ico';
  const sources = ['public/favicon-16.png', 'public/favicon-32.png', 'public/favicon-48.png'];
  await exec('magick', [...sources, ico]);
  return ico;
}

async function main() {
  console.log('Rendering PNGs with sharp (librsvg backend)…');
  for (const spec of PNG_SIZES) {
    const path = await renderPng(spec);
    console.log(`  ✓ ${path} (${spec.size}×${spec.size})`);
  }
  console.log('Building favicon.ico from 16/32/48 PNGs…');
  const ico = await buildIco();
  console.log(`  ✓ ${ico}`);
  // Cleanup intermediate PNGs that don't need to ship.
  for (const f of ['favicon-16.png', 'favicon-32.png', 'favicon-48.png']) {
    await fs.unlink(`public/${f}`).catch(() => {});
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
