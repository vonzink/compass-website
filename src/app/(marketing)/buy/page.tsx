import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/CategoryPage";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { PageJsonLd } from "@/components/seo/PageJsonLd";

export function generateMetadata(): Promise<Metadata> {
  return buildMetadata("/buy", {
    title: "Buy a Home — Mortgage Pre-Approval & Loan Programs | Compass Home Loans",
    description:
      "Get pre-approved with Compass Home Loans, shop with confidence, and explore conventional, FHA, VA, and USDA home loans with guidance from start to finish.",
  });
}

export default function BuyPage() {
  return (
    <>
      <PageJsonLd path="/buy" />
      <CategoryPage cat="buy" />
    </>
  );
}
