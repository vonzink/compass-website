import { describe, it, expect } from "vitest";
import { buildTenantThemeCss } from "./tenantThemeCss";
import { DEFAULT_TENANT_CONFIG } from "@/content/site";

describe("buildTenantThemeCss", () => {
  it("maps Compass theme tokens to the correct CSS variable names", () => {
    const css = buildTenantThemeCss(DEFAULT_TENANT_CONFIG.theme);
    expect(css.startsWith(":root{")).toBe(true);
    expect(css.endsWith("}")).toBe(true);
    expect(css).toContain("--color-green-800:#0f4b48;");
    expect(css).toContain("--color-spring:#8bc53f;");
    expect(css).toContain("--color-spring-soft:rgba(139, 197, 63, 0.16);");
    expect(css).toContain("--color-mint:#c8ec99;");
    expect(css).toContain("--color-on-dark:rgba(255, 255, 255, 0.92);");
    expect(css).toContain("--radius-md:9px;");
    expect(css).toContain("--lip:#5f9821;");
    expect(css).toContain(
      '--font-sans:var(--font-hanken), system-ui, -apple-system, "Segoe UI", sans-serif;',
    );
  });

  it("reflects a swapped second-tenant theme (swap proof)", () => {
    const css = buildTenantThemeCss({
      ...DEFAULT_TENANT_CONFIG.theme,
      green800: "#101820",
      spring: "#ff8800",
      mint: "#ffd1a3",
      radiusMd: "2px",
    });
    expect(css).toContain("--color-green-800:#101820;");
    expect(css).toContain("--color-spring:#ff8800;");
    expect(css).toContain("--color-mint:#ffd1a3;");
    expect(css).toContain("--radius-md:2px;");
    // Untouched tokens keep Compass values.
    expect(css).toContain("--color-ink:#14302e;");
  });

  it("sanitizes CSS/HTML-breaking chars (defense-in-depth)", () => {
    const css = buildTenantThemeCss({
      ...DEFAULT_TENANT_CONFIG.theme,
      green900: "red;}</style><script>",
    });
    expect(css).not.toContain("</style>");
    expect(css).not.toContain("<script>");
    // Only the structural :root{ … } braces survive — the value's were stripped.
    expect(css.match(/[{}]/g)?.length).toBe(2);
  });
});
