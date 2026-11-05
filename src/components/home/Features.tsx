import {
  Calculator,
  Gauge,
  MessageCircle,
  Route,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Section, SectionHead } from "@/components/ui/Section";

const FEATURES = [
  {
    icon: Calculator,
    title: "Structured down to the dollar",
    body: "We compare loan structures against your goals so you can make a decision with the full financial picture in view.",
  },
  {
    icon: MessageCircle,
    title: "Clear communication",
    body: "Straight answers, timely updates, and a clear explanation of what comes next from application through funding.",
  },
  {
    icon: Gauge,
    title: "Operational speed",
    body: "A focused process keeps documents, decisions, and handoffs moving without sacrificing attention to detail.",
  },
  {
    icon: Route,
    title: "Guidance for every move",
    body: "First home, tenth home, refinance, or investment property: the strategy starts with your broader financial goals.",
  },
  {
    icon: Users,
    title: "Partner-ready support",
    body: "Borrowers and real estate partners receive the same proactive coordination and dependable follow-through.",
  },
  {
    icon: ShieldCheck,
    title: "A predictable experience",
    body: "Careful preparation and transparent expectations help reduce friction from pre-approval through closing.",
  },
];

export function Features() {
  return (
    <Section id="why">
      <SectionHead
        eyebrow="Why Compass Home Loans"
        title="Precision where it matters. People when you need them."
        lead="A mortgage process built around thoughtful loan structure, responsive communication, and disciplined execution."
      />
      <div className="grid grid-cols-1 gap-[22px] min-[981px]:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-line bg-white p-[30px] shadow-card"
          >
            <div className="mb-[18px] flex size-[52px] items-center justify-center rounded-[14px] bg-spring-soft text-green-600">
              <feature.icon className="size-6" strokeWidth={1.8} />
            </div>
            <h3 className="mb-2 text-[19px] font-bold tracking-[-0.01em]">
              {feature.title}
            </h3>
            <p className="m-0 text-[15.5px] text-muted">{feature.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
