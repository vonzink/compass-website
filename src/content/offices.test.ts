import { describe, it, expect } from "vitest";
import { OFFICES } from "./offices";

describe("OFFICES", () => {
  it("lists the Compass Fargo office with the supplied contact details", () => {
    expect(OFFICES).toEqual([
      {
        city: "Fargo",
        address: "1630 1st Ave N Ste B, Fargo, ND 58102",
        phone: "218-820-7321",
        fax: "720-293-0300",
        primary: true,
      },
    ]);
  });
});
