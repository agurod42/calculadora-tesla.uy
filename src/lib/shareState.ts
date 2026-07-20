/**
 * Estado del resultado codificado en la URL para compartir: /r/<slug>. Lo usan
 * el botón de compartir (encode) y la ruta /r/[slug] + su OG image (decode).
 */

export interface ShareState {
  verdict: "rinde" | "depende" | "no_rinde";
  teslaId: string;
  /** Ahorro neto mensual (UYU, redondeado). */
  net: number;
  /** km/mes desde los que rinde (0 si no aplica). */
  km: number;
  /** Auto que entrega (etiqueta libre). */
  auto: string;
}

export function encodeState(s: ShareState): string {
  return encodeURIComponent(`${s.verdict}|${s.teslaId}|${Math.round(s.net)}|${s.km}|${s.auto}`);
}

export function decodeState(slug: string): ShareState | null {
  try {
    const parts = decodeURIComponent(slug).split("|");
    if (parts.length < 5) return null;
    const verdict = parts[0] as ShareState["verdict"];
    return {
      verdict,
      teslaId: parts[1]!,
      net: Number(parts[2]) || 0,
      km: Number(parts[3]) || 0,
      auto: parts.slice(4).join("|"),
    };
  } catch {
    return null;
  }
}
