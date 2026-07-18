export function uyu(value: number): string {
  return "$ " + Math.round(value).toLocaleString("es-UY");
}

export function usd(value: number): string {
  return "US$ " + Math.round(value).toLocaleString("es-UY");
}

export function km(value: number): string {
  return Math.round(value).toLocaleString("es-UY") + " km";
}

export function months(value: number): string {
  if (!Number.isFinite(value)) return "nunca";
  if (value < 12) return `${value} meses`;
  const y = Math.floor(value / 12);
  const m = value % 12;
  return m === 0 ? `${y} año${y > 1 ? "s" : ""}` : `${y} a ${m} m`;
}
