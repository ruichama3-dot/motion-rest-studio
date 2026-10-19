import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import type { Scene, Storyboard } from "@/lib/storyboard";

const FONT = "Sora, Manrope, system-ui, sans-serif";

function useEnter(delay = 0, speed = 1) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: (frame - delay) * speed, fps, config: { damping: 18, stiffness: 120 } });
}

function TransitionWrap({ scene, children }: { scene: Scene; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const d = scene.durationInFrames;
  const inP = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const out = interpolate(frame, [d - 10, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let style: React.CSSProperties = { opacity: Math.min(inP, out) };
  if (scene.transition === "slide") style = { ...style, transform: `translateX(${(1 - inP) * 12}%)` };
  if (scene.transition === "zoom") style = { ...style, transform: `scale(${1.12 - inP * 0.12})` };
  if (scene.transition === "wipe") style = { opacity: out, clipPath: `inset(0 ${(1 - inP) * 100}% 0 0)` };
  return <AbsoluteFill style={{ background: scene.background, ...style }}>{children}</AbsoluteFill>;
}

function KineticTitle({ scene }: { scene: Scene }) {
  const { width } = useVideoConfig();
  const words = scene.headline.split(" ");
  const sub = useEnter(10 + words.length * 4, scene.speed);
  const bar = useEnter(4, scene.speed);
  const size = width * 0.075;
  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 8%", fontFamily: FONT }}>
      <div style={{ width: `${bar * 12}%`, height: size * 0.12, background: scene.accent, marginBottom: size * 0.4, borderRadius: 99 }} />
      <h1 style={{ margin: 0, fontSize: size, lineHeight: 1.05, fontWeight: 700, color: scene.foreground, letterSpacing: "-0.03em" }}>
        {words.map((w, i) => (
          <Word key={i} delay={i * 4} speed={scene.speed}>{w} </Word>
        ))}
      </h1>
      <p style={{ marginTop: size * 0.35, fontSize: size * 0.32, color: scene.foreground, opacity: sub * 0.7, transform: `translateY(${(1 - sub) * 20}px)` }}>
        {scene.subline}
      </p>
    </AbsoluteFill>
  );
}

function Word({ delay, speed, children }: { delay: number; speed: number; children: React.ReactNode }) {
  const p = useEnter(delay, speed);
  return (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
      <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)` }}>{children}</span>
    </span>
  );
}

function SplitReveal({ scene }: { scene: Scene }) {
  const { width } = useVideoConfig();
  const p = useEnter(0, scene.speed);
  const t = useEnter(8, scene.speed);
  const size = width * 0.065;
  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <AbsoluteFill style={{ background: scene.accent, clipPath: `inset(0 ${100 - p * 45}% 0 0)` }} />
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: "52%", paddingRight: "6%" }}>
        <h1 style={{ margin: 0, fontSize: size, fontWeight: 700, color: scene.foreground, opacity: t, transform: `translateX(${(1 - t) * 40}px)` }}>{scene.headline}</h1>
        <p style={{ fontSize: size * 0.36, color: scene.foreground, opacity: t * 0.7 }}>{scene.subline}</p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function Stat({ scene }: { scene: Scene }) {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const p = useEnter(0, scene.speed);
  const drift = interpolate(frame, [0, scene.durationInFrames], [1, 1.06]);
  const size = width * 0.22;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, textAlign: "center" }}>
      <div style={{ fontSize: size, fontWeight: 800, color: scene.accent, transform: `scale(${p * drift})`, lineHeight: 1 }}>{scene.headline}</div>
      <div style={{ fontSize: size * 0.16, color: scene.foreground, opacity: p, marginTop: size * 0.1 }}>{scene.subline}</div>
    </AbsoluteFill>
  );
}

function LogoReveal({ scene }: { scene: Scene }) {
  const { width } = useVideoConfig();
  const ring = useEnter(0, scene.speed);
  const text = useEnter(10, scene.speed);
  const s = width * 0.12;
  const [a, ...rest] = scene.headline.split(" ");
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, gap: s * 0.3 }}>
      <div style={{ width: s, height: s, borderRadius: "50%", border: `${s * 0.08}px solid ${scene.accent}`, transform: `scale(${ring}) rotate(${(1 - ring) * -90}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 0, height: 0, borderTop: `${s * 0.18}px solid transparent`, borderBottom: `${s * 0.18}px solid transparent`, borderLeft: `${s * 0.28}px solid ${scene.accent}`, marginLeft: s * 0.06 }} />
      </div>
      <div style={{ fontSize: s * 0.5, fontWeight: 800, letterSpacing: "0.04em", clipPath: `inset(0 ${(1 - text) * 100}% 0 0)` }}>
        <span style={{ color: scene.foreground }}>{a} </span>
        <span style={{ color: scene.accent }}>{rest.join(" ")}</span>
      </div>
      <div style={{ fontSize: s * 0.18, color: scene.foreground, opacity: text * 0.6 }}>{scene.subline}</div>
    </AbsoluteFill>
  );
}

const TEMPLATES = { "kinetic-title": KineticTitle, "split-reveal": SplitReveal, stat: Stat, "logo-reveal": LogoReveal };

export function MotionVideo({ storyboard }: { storyboard: Storyboard }) {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: "#FFFFFF" }}>
      {storyboard.scenes.map((scene) => {
        const C = TEMPLATES[scene.template];
        const seq = (
          <Sequence key={scene.id} from={from} durationInFrames={scene.durationInFrames}>
            <TransitionWrap scene={scene}>
              <C scene={scene} />
            </TransitionWrap>
          </Sequence>
        );
        from += scene.durationInFrames;
        return seq;
      })}
    </AbsoluteFill>
  );
}
