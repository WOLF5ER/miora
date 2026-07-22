import sharp from "sharp";

await sharp("D:/Miora/public/brand/out/dark-rounded.png").resize(96, 96).png().toFile("D:/Miora/public/brand/logo-dark.png");
await sharp("D:/Miora/public/brand/out/light-rounded.png").resize(96, 96).png().toFile("D:/Miora/public/brand/logo-light.png");
console.log("done");
