import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const CROP = { left: 464, top: 128, size: 472 };
const RADIUS_FRAC = 0.2; // corner radius as fraction of crop size — cuts away any bg bleed

async function sampleColor(path, x, y) {
  const { data } = await sharp(path)
    .extract({ left: x, top: y, width: 3, height: 3 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = data.length / 9;
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < 9; i++) {
    r += data[i * ch];
    g += data[i * ch + 1];
    b += data[i * ch + 2];
  }
  return { r: Math.round(r / 9), g: Math.round(g / 9), b: Math.round(b / 9) };
}

async function buildTheme(name) {
  const src = `D:/Miora/public/brand/icon-${name}.png`;
  const { left, top, size } = CROP;
  const radius = Math.round(size * RADIUS_FRAC);

  // panel flat color, sampled left-middle and right-middle (well inside the flat zone, away from the mark)
  const p1 = await sampleColor(src, left + 15, top + Math.round(size * 0.5));
  const p2 = await sampleColor(src, left + size - 18, top + Math.round(size * 0.5));
  const bg = { r: Math.round((p1.r + p2.r) / 2), g: Math.round((p1.g + p2.g) / 2), b: Math.round((p1.b + p2.b) / 2) };
  console.log(name, "bg color", bg);

  const roundedMaskSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`
  );

  const cropped = await sharp(src).extract({ left, top, width: size, height: size }).png().toBuffer();

  // "any": rounded square, transparent corners (standard app-icon look)
  const roundedTransparent = await sharp(cropped)
    .composite([{ input: roundedMaskSvg, blend: "dest-in" }])
    .png()
    .toBuffer();

  await mkdir(`D:/Miora/public/brand/out`, { recursive: true });
  await sharp(roundedTransparent).toFile(`D:/Miora/public/brand/out/${name}-rounded.png`);

  // maskable: opaque bg color, full bleed, rounded content scaled down & centered
  const contentSize = Math.round(size * 0.84);
  const contentResized = await sharp(roundedTransparent).resize(contentSize, contentSize).toBuffer();
  const maskable = await sharp({
    create: { width: size, height: size, channels: 4, background: { ...bg, alpha: 1 } },
  })
    .composite([{ input: contentResized, gravity: "center" }])
    .png()
    .toBuffer();
  await sharp(maskable).toFile(`D:/Miora/public/brand/out/${name}-maskable.png`);
}

await buildTheme("dark");
await buildTheme("light");
console.log("done");
