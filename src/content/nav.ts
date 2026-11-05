/**
 * Navigation model for the dedicated Compass site.
 */

import { COMPASS_APPLICATION_URL } from "@/content/links";

export type NavLink = { label: string; href: string; badge?: string };
export type NavItem = { label: string; href: string; items: NavLink[] };

export const NAV: NavItem[] = [
  {
    label: "Purchase",
    href: COMPASS_APPLICATION_URL,
    items: [],
  },
  {
    label: "Refinance",
    href: COMPASS_APPLICATION_URL,
    items: [],
  },
  {
    label: "Mortgage Calculators",
    href: "/coming-soon",
    items: [
      { label: "Affordability calculator", href: "/coming-soon" },
      { label: "Mortgage calculator", href: "/coming-soon" },
      { label: "Rent vs buy calculator", href: "/coming-soon" },
      { label: "Cash-out calculator", href: "/coming-soon" },
      { label: "Investment calculator", href: "/coming-soon" },
    ],
  },
  {
    label: "Services",
    href: "/#services",
    items: [
      { label: "Purchase loans", href: COMPASS_APPLICATION_URL },
      { label: "VA loans", href: "/veterans" },
      { label: "Reverse mortgages", href: "/reverse" },
      { label: "Investment loans", href: "/investment" },
      { label: "Commercial loans", href: "/commercial" },
      { label: "Home equity", href: "/home-equity" },
    ],
  },
  {
    label: "Rates",
    href: "/rates",
    items: [
      { label: "Purchase rates", href: "/rates" },
      { label: "Refinance rates", href: "/rates" },
      { label: "Cash-out rates", href: "/rates" },
      { label: "HELOC rates", href: "/rates" },
      { label: "VA rates", href: "/rates" },
    ],
  },
  {
    label: "Loan Officers",
    href: "/loan-officers",
    items: [
      { label: "Meet the team", href: "/loan-officers" },
      { label: "Find by location", href: "/loan-officers" },
      { label: "Schedule a call", href: "/loan-officers" },
    ],
  },
];

/**
 * Resolve the primary navigation for a tenant without removing the dormant
 * routes. Rates can be restored by publishing the corresponding feature flag.
 */
export function navigationForFeatures({
  ratesNavigation,
}: {
  ratesNavigation: boolean;
}): NavItem[] {
  if (ratesNavigation) return NAV;

  return NAV.filter((item) => item.href !== "/rates").map((item) => ({
    ...item,
    items: item.items.filter((sub) => sub.href !== "/rates"),
  }));
}

export type FooterColumn = { heading: string; links: NavLink[] };

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Resources",
    links: [
      { label: "Affordability calculator", href: "/coming-soon" },
      { label: "Mortgage calculator", href: "/coming-soon" },
      { label: "Rent vs buy calculator", href: "/coming-soon" },
      { label: "HELOC calculator", href: "/coming-soon" },
      { label: "Buy a home", href: COMPASS_APPLICATION_URL },
      { label: "Mortgage Glossary", href: "/resources/mortgage-glossary" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Media", href: "/coming-soon" },
      { label: "Know Your Lender", href: "/know-your-lender" },
      { label: "Loan officers", href: "/loan-officers" },
      { label: "Developers", href: "/developers" },
      { label: "FAQs", href: "/coming-soon" },
    ],
  },
];

/** Contact & legal links column (rendered with live contact details). */
export const FOOTER_LEGAL_LINKS: NavLink[] = [
  { label: "Licensing & Disclosures", href: "/licensing" },
  { label: "Privacy Notice", href: "/privacy-notice" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Texas Consumer Notice", href: "/texas-required-notice" },
  { label: "NMLS Consumer Access", href: "/nmls-consumer-access" },
  { label: "Site Map", href: "/sitemap" },
];
