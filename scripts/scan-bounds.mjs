import sharp from "sharp";

async function rowScan(path, y, step = 10) {
  const img = sharp(path);
  const meta = await img.metadata();
  const { data } = await img.clone().extract({ left: 0, top: y, width: meta.width, height: 1 }).raw().toBuffer({ resolveWithObject: true });
  const channels = data.length / meta.width;
  const out = [];
  for (let x = 0; x < meta.width; x += step) {
    const i = x * channels;
    out.push([x, data[i], data[i + 1], data[i + 2]]);
  }
  return out;
}

async function colScan(path, x, step = 10) {
  const img = sharp(path);
  const meta = await img.metadata();
  const { data } = await img.clone().extract({ left: x, top: 0, width: 1, height: meta.height }).raw().toBuffer({ resolveWithObject: true });
  const channels = data.length / meta.height;
  const out = [];
  for (let y = 0; y < meta.height; y += step) {
    const i = y * channels;
    out.push([y, data[i], data[i + 1], data[i + 2]]);
  }
  return out;
}

function printRun(samples, label) {
  // find longest run of low-variance neighboring samples
  let bestStart = 0, bestLen = 0, curStart = 0, curLen = 1;
  for (let i = 1; i < samples.length; i++) {
    const [, r1, g1, b1] = samples[i - 1];
    const [, r2, g2, b2] = samples[i];
    const d = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
    if (d < 10) {
      curLen++;
    } else {
      if (curLen > bestLen) { bestLen = curLen; bestStart = curStart; }
      curStart = i; curLen = 1;
    }
  }
  if (curLen > bestLen) { bestLen = curLen; bestStart = curStart; }
  const startCoord = samples[bestStart][0];
  const endCoord = samples[Math.min(bestStart + bestLen - 1, samples.length - 1)][0];
  console.log(label, "run from", startCoord, "to", endCoord, "color~", samples[bestStart].slice(1));
}

const darkPath = "D:/Miora/public/brand/icon-dark.png";
const lightPath = "D:/Miora/public/brand/icon-light.png";

printRun(await rowScan(darkPath, 400), "dark row@400 (x-range)");
printRun(await colScan(darkPath, 700), "dark col@700 (y-range)");
printRun(await rowScan(lightPath, 400), "light row@400 (x-range)");
printRun(await colScan(lightPath, 700), "light col@700 (y-range)");
