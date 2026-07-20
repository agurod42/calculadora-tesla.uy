/**
 * Siluetas minimalistas de carrocería (dibujo propio, genérico — no reproduce
 * el diseño registrado de ningún modelo). Se usan en el paso 2 y en la OG image.
 */

export type Body = "sedan" | "suv";

export const SILHOUETTES: Record<Body, { viewBox: string; path: string; wheels: [number, number, number][] }> = {
  sedan: {
    viewBox: "0 0 240 96",
    path: "M10 64 C10 55 16 53 24 51 L66 47 C74 35 90 27 112 25 C142 22 162 27 178 41 L216 47 C228 49 234 53 234 63 L234 68 C234 72 230 74 226 74 L206 74 A20 20 0 0 0 166 74 L98 74 A20 20 0 0 0 58 74 L18 74 C13 74 10 71 10 67 Z",
    wheels: [
      [78, 74, 14],
      [186, 74, 14],
    ],
  },
  suv: {
    viewBox: "0 0 240 104",
    path: "M10 70 C10 60 16 58 24 56 L60 52 C66 38 82 26 108 24 C140 21 168 24 184 40 L214 50 C228 53 234 58 234 70 L234 76 C234 80 230 82 226 82 L206 82 A20 20 0 0 0 166 82 L98 82 A20 20 0 0 0 58 82 L18 82 C13 82 10 79 10 75 Z",
    wheels: [
      [78, 82, 14],
      [186, 82, 14],
    ],
  },
};
