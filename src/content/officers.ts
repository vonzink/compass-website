/** Compass Home Loans officer directory and Postgres seed source. */

import { COMPASS_APPLICATION_URL } from "@/content/links";

export type Officer = {
  slug: string;
  name: string;
  title: string;
  nmls: string;
  email: string;
  phone: string;
  states: string[];
  photo: string;
  bio: string[];
  applyHref: string;
  calendarId?: string;
};

const STATE_NAMES: Record<string, string> = {
  CO: "Colorado",
  ND: "North Dakota",
  MN: "Minnesota",
  SD: "South Dakota",
  TX: "Texas",
  IN: "Indiana",
  MI: "Michigan",
};

export function stateName(code: string): string {
  return STATE_NAMES[code] ?? code;
}

export function telDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

export const OFFICERS: Officer[] = [
  {
    slug: "will-provost",
    name: "Will Provost",
    title: "Mortgage Loan Officer",
    nmls: "2073929",
    email: "William.Provost@CompassHL.us",
    phone: "218-820-7321",
    states: [],
    photo: "/officers/will-provost.png",
    bio: [
      "Raised in Central Minnesota, I earned my engineering degree from North Dakota State University before bringing my problem-solving and attention to detail attitude to the mortgage industry. Over the past six years as a licensed loan officer, I have combined a natural fluency with numbers and analytical discipline to help families successfully navigate the financing process, purchase their first home or their tenth home, and reach their broader financial goals.",
      "At Compass Home Loans, we approach residential lending with a focus on precision, clear communication, and operational speed. Rather than using a one-size-fits-all approach, I like to evaluate every loan structure down to the dollar, ensuring borrowers and real estate partners experience a predictable, low-friction closing from pre-approval through funding.",
    ],
    applyHref: COMPASS_APPLICATION_URL,
  },
  {
    slug: "seth-angell",
    name: "Seth Angell",
    title: "Executive VP / Mortgage Loan Officer",
    nmls: "912881",
    email: "seth.angell@msfg.us",
    phone: "(303) 883-8519",
    states: ["CO", "IN", "MI", "MN", "ND"],
    photo: "/officers/seth-angell.webp",
    bio: [
      "As Executive Vice President at Mountain State Financial Group, LLC, I bring nearly 20 years of residential lending experience to Compass Home Loans. My focus is always on delivering a transparent, efficient, and empowering mortgage experience for every client.",
      "Before entering the mortgage industry, I spent several years as a teacher. That background still shapes how I break complex concepts into straightforward, actionable steps for first-time buyers, experienced homeowners, and real estate investors.",
      "I believe in staying ahead of market trends, being proactive, and communicating openly because confidence in lending comes from understanding and trust.",
      "Outside the office, I enjoy golfing, fishing, the Colorado outdoors, and following Minnesota sports.",
    ],
    applyHref:
      "https://www.blink.mortgage/app/signup/p/mountainstatefinancialgroupllc/sethangell",
  },
];

export function officerStates(
  officers: Officer[] = OFFICERS,
): { code: string; name: string }[] {
  const seen = new Set<string>();
  for (const officer of officers) {
    for (const state of officer.states) seen.add(state);
  }
  return [...seen]
    .map((code) => ({ code, name: stateName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
