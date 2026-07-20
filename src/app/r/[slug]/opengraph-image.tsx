import { ImageResponse } from "next/og";
import { TESLA_MODELS } from "@/data";
import { SILHOUETTES } from "@/data/silhouettes";
import { decodeState } from "@/lib/shareState";

export const alt = "Resultado — ¿Te rinde un Tesla?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const uyu = (n: number) => "$ " + Math.round(n).toLocaleString("es-UY");

export default function Image({ params }: { params: { slug: string } }) {
  const st = decodeState(params.slug);
  const tesla = TESLA_MODELS.find((m) => m.id === st?.teslaId) ?? TESLA_MODELS[0]!;
  const sil = SILHOUETTES[tesla.body];

  let title = "¿Te rinde un Tesla?";
  let line = "Calculadora para Uruguay";
  let chip = { bg: "#2b2f36", fg: "#e6e6e6", text: "Con números reales" };

  if (st?.verdict === "rinde") {
    title = "Me rinde";
    line = `Ahorro ${uyu(st.net)}/mes cambiando por el ${tesla.name}`;
    chip = { bg: "#E1F5EE", fg: "#04342C", text: "Te rinde" };
  } else if (st?.verdict === "no_rinde") {
    title = "Todavía no me rinde";
    line = st.km > 0
      ? `Me convendría a partir de ${st.km.toLocaleString("es-UY")} km/mes`
      : `Con mi uso, la cuota se come el ahorro`;
    chip = { bg: "#FAECE7", fg: "#4A1B0C", text: "No rinde (aún)" };
  } else if (st?.verdict === "depende") {
    title = "Depende";
    line = st.km > 0 ? `Me rinde arriba de ${st.km.toLocaleString("es-UY")} km/mes` : "El ahorro casi cubre la cuota";
    chip = { bg: "#FAEEDA", fg: "#412402", text: "Depende" };
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#171a20",
          padding: "68px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "14px",
              background: "#000",
            }}
          >
            <svg width="38" height="38" viewBox="0 0 32 32" fill="none">
              <path d="M18.5 5 L9 17.8 h5.2 l-1.7 9.2 L23 13.4 h-5.6 z" fill="#fff" />
            </svg>
          </div>
          <div style={{ color: "#9a9a9a", fontSize: "28px" }}>calculadoratesla.uy</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ color: "#fff", fontSize: "84px", fontWeight: 600, lineHeight: 1.02 }}>{title}</div>
          <div style={{ color: "#c9c9c9", fontSize: "38px", lineHeight: 1.25 }}>{line}</div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              padding: "12px 30px",
              borderRadius: "999px",
              background: chip.bg,
              color: chip.fg,
              fontSize: "30px",
              fontWeight: 600,
            }}
          >
            {chip.text}
          </div>
          <svg width="360" height={sil.viewBox.includes("104") ? "156" : "144"} viewBox={sil.viewBox} fill="#fff">
            <path d={sil.path} />
            {sil.wheels.map(([cx, cy, r], i) => (
              <circle key={i} cx={cx} cy={cy} r={r} />
            ))}
          </svg>
        </div>
      </div>
    ),
    { ...size },
  );
}
