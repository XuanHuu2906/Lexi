import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lexi — Learn English",
    short_name: "Lexi",
    description:
      "Your AI tutor for vocabulary, grammar, real conversations and TOEIC.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F4F2FB",
    theme_color: "#6C4BF5",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
