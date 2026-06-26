import * as React from "react";
import { Reveal, PawIcon } from "./Decorative";
import { TiltCard } from "./Cat3D";
import {
  MapVisual, RouteVisual, NetworkVisual, RecoveryVisual, KanbanVisual,
  QuizVisual, DashboardVisual, LeaderboardVisual, VisionVisual,
} from "./FeatureVisuals";

type Feature = {
  eyebrow: string;
  title: string;
  desc: string;
  Visual: () => React.ReactElement;
};

const features: Feature[] = [
  {
    eyebrow: "Mapping",
    title: "Interactive Global Map & Priority Heatmaps",
    desc: "Color-coded markers — green for managed colonies, red for unmanaged, purple for traps — auto-zoom to your full coverage area. Glowing red heatmaps highlight colonies with 5+ unneutered cats so you always know where to go next.",
    Visual: MapVisual,
  },
  {
    eyebrow: "Field ops",
    title: "Route Optimization & Planner",
    desc: "A nearest-neighbor TSP solver stitches your active traps into the shortest possible loop, drawn as a dashed polyline with total distance computed via Haversine. Less driving, more cats.",
    Visual: RouteVisual,
  },
  {
    eyebrow: "Network",
    title: "Hierarchical Network Graph",
    desc: "A canvas-based graph maps the relationships between colonies, volunteers, and individual cats. Click a node to fan its cats outward, watch unexpanded nodes pulse, and jump anywhere with the search bar.",
    Visual: NetworkVisual,
  },
  {
    eyebrow: "Aftercare",
    title: "Post-Op Recovery & Celebration Overlay",
    desc: "Track every cat recovering from surgery on one tender dashboard. When a cat is cleared for release, a celebratory animation bounds across the screen — because moments like that deserve confetti.",
    Visual: RecoveryVisual,
  },
  {
    eyebrow: "Adoption",
    title: "Adoption Pipeline (Kanban)",
    desc: "Drag cats through TNR → Socializing → Ready for Adoption → Adopted. Filter by colony, gate finalization to admins, and watch a heart burst when a cat lands in their forever home.",
    Visual: KanbanVisual,
  },
  {
    eyebrow: "Engagement",
    title: "Cat Matchmaker Quiz",
    desc: "A step-by-step personality quiz — home energy, other pets, play style — pairs adopters with an adoptable cat that actually fits their life. A flipping quiz card morphs as answers come in.",
    Visual: QuizVisual,
  },
  {
    eyebrow: "Insights",
    title: "Dashboard & Telemetry",
    desc: "A Recharts donut tracks TNR progress, bar charts celebrate volunteer activity, and a four-paw walking loader keeps things charming while data loads.",
    Visual: DashboardVisual,
  },
  {
    eyebrow: "Recognition",
    title: "Leaderboard & Custom Cat Avatars",
    desc: "The Paws of Honor leaderboard ranks top volunteers with gold, silver, and bronze badges. A dynamic SVG avatar engine generates unique cat faces — Orange Tabby, Tuxedo, Calico, and more — no stock art required.",
    Visual: LeaderboardVisual,
  },
  {
    eyebrow: "Vision AI",
    title: "Kitty Cam Vision AI",
    desc: "Snap a field photo and our vision AI auto-detects ear-tipping (the TNR marker), then suggests breed and coat pattern to pre-fill the intake form — fewer taps, more time with cats.",
    Visual: VisionVisual,
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-20 px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center mb-16 md:mb-24">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium mb-4">
              <PawIcon size={14} /> Everything you need in the field
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              A full toolkit for <span className="text-gradient-warm">colony care</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Nine focused tools designed by volunteers, for volunteers. Each one earns its place on the home screen.
            </p>
          </div>
        </Reveal>

        <div className="space-y-24 md:space-y-32">
          {features.map((f, i) => {
            const reverse = i % 2 === 1;
            return (
              <div key={f.title}
                className={`grid gap-10 md:gap-16 md:grid-cols-2 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
                <Reveal x={reverse ? 40 : -40}>
                  <TiltCard>
                    <f.Visual />
                  </TiltCard>
                </Reveal>

                <Reveal x={reverse ? -40 : 40} delay={0.1}>
                  <div>
                    <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider mb-4"
                      style={{ color: "var(--amber)" }}>
                      <span className="font-bold">{String(i + 1).padStart(2, "0")}</span>
                      <span>·</span>
                      <span>{f.eyebrow}</span>
                    </div>
                    <h3 className="font-display text-3xl md:text-4xl font-bold leading-tight">{f.title}</h3>
                    <p className="mt-4 text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
