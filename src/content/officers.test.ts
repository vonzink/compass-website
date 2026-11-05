import { describe, expect, it } from "vitest";
import { OFFICERS } from "./officers";

const WILL_APPLY_URL =
  "https://www.blink.mortgage/app/signup/p/mountainstatefinancialgroupllc/williamprovost";

describe("Compass loan officers", () => {
  it("lists only Will Provost and Seth Angell", () => {
    expect(OFFICERS.map((officer) => officer.slug)).toEqual([
      "will-provost",
      "seth-angell",
    ]);
  });

  it("uses Will Provost's supplied public profile details", () => {
    const will = OFFICERS[0];

    expect(will).toMatchObject({
      name: "Will Provost",
      title: "Mortgage Loan Officer",
      nmls: "2073929",
      email: "William.Provost@CompassHL.us",
      phone: "218-820-7321",
      photo: "/officers/will-provost.png",
      applyHref: WILL_APPLY_URL,
    });
    expect(will.bio.join(" ")).toContain("Raised in Central Minnesota");
    expect(will.bio.join(" ")).toContain("predictable, low-friction closing");
  });
});
