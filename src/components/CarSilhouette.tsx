import { SILHOUETTES, type Body } from "@/data/silhouettes";

export function CarSilhouette({
  body,
  className,
  color = "currentColor",
}: {
  body: Body;
  className?: string;
  color?: string;
}) {
  const s = SILHOUETTES[body];
  return (
    <svg viewBox={s.viewBox} className={className} fill={color} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d={s.path} />
      {s.wheels.map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} />
      ))}
    </svg>
  );
}
