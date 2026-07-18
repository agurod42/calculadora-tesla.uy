import { ImageResponse } from "next/og";

export const alt = "Calculadora Tesla Uruguay — ¿te conviene cambiar tu auto?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              background: "#000",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
              <path d="M18.5 5 L9 17.8 h5.2 l-1.7 9.2 L23 13.4 h-5.6 z" fill="#fff" />
            </svg>
          </div>
          <div style={{ color: "#9a9a9a", fontSize: "30px" }}>calculadoratesla.uy</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ color: "#fff", fontSize: "82px", fontWeight: 600, lineHeight: 1.05 }}>
            ¿Te rinde un Tesla?
          </div>
          <div style={{ color: "#c9c9c9", fontSize: "36px", lineHeight: 1.3 }}>
            Calculadora para Uruguay: nafta vs. eléctrico, préstamo y patente. Con números reales.
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              padding: "12px 28px",
              borderRadius: "999px",
              background: "#E1F5EE",
              color: "#04342C",
              fontSize: "30px",
              fontWeight: 600,
            }}
          >
            Te rinde
          </div>
          <div
            style={{
              display: "flex",
              padding: "12px 28px",
              borderRadius: "999px",
              background: "#2b2f36",
              color: "#e6e6e6",
              fontSize: "30px",
            }}
          >
            Gratis · sin registro
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
