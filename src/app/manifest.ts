import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Miora — Ближе к красоте",
    short_name: "Miora",
    description: "Платформа, которая соединяет мастеров бьюти-индустрии и клиентов: портфолио, отзывы и запись без переписки.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#2C3441",
    theme_color: "#7C4B56",
    lang: "ru",
    categories: ["lifestyle", "business", "beauty"],
    icons: [
      { src: "/icons/icon-dark-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-dark-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-dark-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
