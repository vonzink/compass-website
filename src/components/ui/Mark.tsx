import { cn } from "@/lib/cn";

/** Compass mark with an optional soft brand-color halo. */
export function Mark({
  size = 30,
  glow = false,
  className,
  label,
}: {
  size?: number;
  glow?: boolean;
  className?: string;
  /** Accessible name for the glyph — the tenant short name. Threaded from a
   *  server parent (or a client parent's prop) so the mark is never hardcoded
   *  to a single brand. */
  label: string;
}) {
  return (
    <span
      className={cn("relative inline-block align-middle", className)}
      style={{ width: size, height: size }}
    >
      {glow && (
        <span
          aria-hidden
          className="absolute rounded-full"
          style={{
            inset: -14,
            background:
              "radial-gradient(circle, rgba(52,209,126,0.55), transparent 70%)",
            filter: "blur(6px)",
          }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/compass-mark.webp"
        alt={label}
        width={size}
        height={size}
        className="relative size-full object-contain"
      />
    </span>
  );
}
