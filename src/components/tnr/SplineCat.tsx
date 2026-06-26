import { Suspense, lazy } from "react";

// Lazy-load Spline so the 3D runtime only ships when this component mounts.
const Spline = lazy(() => import("@splinetool/react-spline"));

type Props = {
  /**
   * Public Spline scene URL ending in `.splinecode`.
   * Create one at https://spline.design, then File → Export → Code (React)
   * and paste the scene URL here.
   */
  scene?: string;
  className?: string;
};

// Default placeholder — a friendly community scene. Replace with your own
// cat scene exported from Spline for a custom mascot.
const DEFAULT_SCENE =
  "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode";

export function SplineCat({ scene = DEFAULT_SCENE, className }: Props) {
  return (
    <div
      className={
        "relative w-full aspect-square rounded-[2rem] overflow-hidden glass-strong " +
        (className ?? "")
      }
      style={{
        boxShadow:
          "0 40px 80px -30px rgba(45, 106, 79, 0.25), var(--shadow-glow-amber)",
      }}
    >
      <Suspense
        fallback={
          <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
            Loading 3D cat…
          </div>
        }
      >
        <Spline scene={scene} style={{ width: "100%", height: "100%" }} />
      </Suspense>
      {/* Hide the Spline watermark badge */}
      <div className="absolute bottom-3 right-3 h-12 w-40 bg-transparent pointer-events-none" />
    </div>
  );
}

export default SplineCat;
