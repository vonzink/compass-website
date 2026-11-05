import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/CategoryPage";
import { AskAiLauncher } from "@/components/ai/AskAiLauncher";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { getTenantConfig } from "@/server/tenant/config";

const STARTERS = [
  "What property types do you finance?",
  "Do you finance multifamily?",
  "What is a commercial DSCR loan?",
  "How do I get started?",
];

export function generateMetadata(): Promise<Metadata> {
  return buildMetadata("/commercial", {
    title: "Commercial Real Estate Loans | Compass Home Loans",
    description:
      "Explore commercial, multifamily, and mixed-use real estate financing structured around your business and your property.",
    canonical: "/commercial",
  });
}

export default async function CommercialPage() {
  const config = await getTenantConfig();
  return (
    <>
      <PageJsonLd path="/commercial" />
      <CategoryPage cat="commercial" />
      <AskAiLauncher
        enabled={config.features.askAiChat}
        starters={STARTERS}
        assistantName={config.brand.assistantName}
        shortName={config.brand.shortName}
        iconSrc={config.brand.logos.mark}
      />
    </>
  );
}
