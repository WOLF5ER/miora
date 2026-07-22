import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT = "D:/Miora/public/icons";
await mkdir(OUT, { recursive: true });

async function resizeTo(srcPath, outName, size) {
  await sharp(srcPath).resize(size, size).png().toFile(`${OUT}/${outName}`);
}

// Regular ("any") icons — transparent rounded corners, standard app-icon look.
await resizeTo("D:/Miora/public/brand/out/dark-rounded.png", "icon-dark-192.png", 192);
await resizeTo("D:/Miora/public/brand/out/dark-rounded.png", "icon-dark-512.png", 512);
await resizeTo("D:/Miora/public/brand/out/dark-rounded.png", "favicon-dark-48.png", 48);
await resizeTo("D:/Miora/public/brand/out/light-rounded.png", "icon-light-192.png", 192);
await resizeTo("D:/Miora/public/brand/out/light-rounded.png", "icon-light-512.png", 512);
await resizeTo("D:/Miora/public/brand/out/light-rounded.png", "favicon-light-48.png", 48);

// Maskable — opaque, full-bleed, content in the safe zone.
await resizeTo("D:/Miora/public/brand/out/dark-maskable.png", "icon-dark-512-maskable.png", 512);
await resizeTo("D:/Miora/public/brand/out/light-maskable.png", "icon-light-512-maskable.png", 512);

// Apple touch icon: opaque, full-bleed, NO shrink (iOS applies its own corner mask,
// and transparent corners would render as ugly black on iOS home screens).
async function buildAppleIcon(themeName, bg) {
  const cropped = await sharp(`D:/Miora/public/brand/icon-${themeName}.png`)
    .extract({ left: 464, top: 128, width: 472, height: 472 })
    .png()
    .toBuffer();
  const radius = Math.round(472 * 0.2);
  const roundedMaskSvg = Buffer.from(
    `<svg width="472" height="472"><rect x="0" y="0" width="472" height="472" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`
  );
  const roundedTransparent = await sharp(cropped).composite([{ input: roundedMaskSvg, blend: "dest-in" }]).png().toBuffer();
  const full = await sharp({ create: { width: 472, height: 472, channels: 4, background: { ...bg, alpha: 1 } } })
    .composite([{ input: roundedTransparent, gravity: "center" }])
    .png()
    .toBuffer();
  await sharp(full).resize(180, 180).png().toFile(`${OUT}/apple-icon-${themeName}.png`);
}

await buildAppleIcon("dark", { r: 44, g: 52, b: 65 });
await buildAppleIcon("light", { r: 249, g: 242, b: 235 });

console.log("done");
