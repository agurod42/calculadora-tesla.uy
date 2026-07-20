import type { Metadata } from "next";
import Link from "next/link";
import { TESLA_MODELS } from "@/data";
import { decodeState } from "@/lib/shareState";

const uyu = (n: number) => "$ " + Math.round(n).toLocaleString("es-UY");

function copy(slug: string) {
  const st = decodeState(slug);
  const tesla = TESLA_MODELS.find((m) => m.id === st?.teslaId) ?? TESLA_MODELS[0]!;
  const image = tesla.image;
  if (st?.verdict === "rinde") {
    return {
      title: `Me rinde: ahorro ${uyu(st.net)}/mes con el ${tesla.name}`,
      sub: `Cambiar ${st.auto || "mi auto"} por un ${tesla.name} me rinde. Calculá tu caso.`,
      image,
      alt: tesla.name,
      tone: "text-emerald-600",
      big: "Me rinde",
      detail: `Ahorro neto ${uyu(st.net)}/mes cambiando por el ${tesla.name}.`,
    };
  }
  if (st?.verdict === "no_rinde") {
    return {
      title: "Todavía no me rinde un Tesla",
      sub: st && st.km > 0 ? `Me convendría a partir de ${st.km.toLocaleString("es-UY")} km/mes. Probá el tuyo.` : "Calculá tu caso.",
      image,
      alt: tesla.name,
      tone: "text-rose-600",
      big: "Todavía no me rinde",
      detail: st && st.km > 0 ? `Me empezaría a rendir a partir de ~${st.km.toLocaleString("es-UY")} km/mes.` : "Con mi uso, la cuota se come el ahorro.",
    };
  }
  return {
    title: "¿Me rinde un Tesla? Depende",
    sub: "Calculá tu caso con datos reales.",
    image,
    alt: tesla.name,
    tone: "text-amber-600",
    big: "Depende",
    detail: st && st.km > 0 ? `Me rinde arriba de ${st.km.toLocaleString("es-UY")} km/mes.` : "El ahorro casi cubre la cuota.",
  };
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = copy(params.slug);
  return { title: c.title, description: c.sub, alternates: { canonical: "/" } };
}

export default function ResultPage({ params }: { params: { slug: string } }) {
  const c = copy(params.slug);
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-5 py-10">
      <div className="flex items-center justify-center rounded-2xl bg-white py-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.image} alt={c.alt} className="h-44 w-auto object-contain" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">¿Te rinde un Tesla?</p>
        <p className={`mt-1 text-3xl font-semibold tracking-tight ${c.tone}`}>{c.big}</p>
        <p className="mt-2 text-neutral-600">{c.detail}</p>
      </div>
      <Link
        href="/"
        className="rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-black"
      >
        Calculá tu caso →
      </Link>
      <p className="text-xs text-neutral-400">
        Estimación orientativa, no es asesoramiento financiero. Sitio no afiliado a Tesla.
      </p>
    </main>
  );
}
