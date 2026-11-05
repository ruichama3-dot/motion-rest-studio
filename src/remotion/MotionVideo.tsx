import {
  AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";
import type { Layer, Scene, Storyboard } from "@/lib/storyboard";

const FONT = "Sora, Manrope, system-ui, sans-serif";

function useEnter(delay = 0, speed = 1) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: (frame - delay) * speed, fps, config: { damping: 18, stiffness: 120 } });
}

function TransitionWrap({ scene, children }: { scene: Scene; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const d = scene.durationInFrames;
  const inP = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const out = interpolate(frame, [d - 12, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let style: React.CSSProperties = { opacity: Math.min(inP, out) };
  if (scene.transition === "slide") style = { ...style, transform: `translateX(${(1 - inP) * 10}%)` };
  if (scene.transition === "zoom") style = { ...style, transform: `scale(${1.16 - inP * 0.16})` };
  if (scene.transition === "rotate") style = { ...style, transform: `perspective(1200px) rotateY(${(1 - inP) * -18}deg) scale(${0.96 + inP * 0.04})` };
  if (scene.transition === "wipe") style = { opacity: out, clipPath: `inset(0 ${(1 - inP) * 100}% 0 0)` };
  return <AbsoluteFill style={{ background: scene.background, overflow: "hidden", ...style }}>{children}</AbsoluteFill>;
}

function Word({ delay, speed, children }: { delay: number; speed: number; children: React.ReactNode }) {
  const p = useEnter(delay, speed);
  return <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", marginRight: "0.25em" }}><span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)` }}>{children}</span></span>;
}

function KineticTitle({ scene }: { scene: Scene }) {
  const { width } = useVideoConfig();
  const words = scene.headline.split(" ");
  const sub = useEnter(10 + words.length * 4, scene.speed);
  const bar = useEnter(4, scene.speed);
  const size = width * 0.075;
  return <AbsoluteFill style={{ justifyContent: "center", padding: "0 8%", fontFamily: FONT }}>
    <div style={{ width: `${bar * 12}%`, height: size * 0.12, background: scene.accent, marginBottom: size * 0.4, borderRadius: 99 }} />
    <h1 style={{ margin: 0, fontSize: size, lineHeight: 1.05, fontWeight: 700, color: scene.foreground, letterSpacing: "-0.03em" }}>{words.map((w, i) => <Word key={i} delay={i * 4} speed={scene.speed}>{w}</Word>)}</h1>
    <p style={{ marginTop: size * 0.35, fontSize: size * 0.32, color: scene.foreground, opacity: sub * 0.7, transform: `translateY(${(1 - sub) * 20}px)` }}>{scene.subline}</p>
  </AbsoluteFill>;
}

function SplitReveal({ scene }: { scene: Scene }) {
  const { width } = useVideoConfig(); const p = useEnter(0, scene.speed); const t = useEnter(8, scene.speed); const size = width * 0.065;
  return <AbsoluteFill style={{ fontFamily: FONT }}><AbsoluteFill style={{ background: scene.accent, clipPath: `inset(0 ${100 - p * 45}% 0 0)` }} /><AbsoluteFill style={{ justifyContent: "center", paddingLeft: "52%", paddingRight: "6%" }}><h1 style={{ margin: 0, fontSize: size, fontWeight: 700, color: scene.foreground, opacity: t, transform: `translateX(${(1 - t) * 40}px)` }}>{scene.headline}</h1><p style={{ fontSize: size * 0.36, color: scene.foreground, opacity: t * 0.7 }}>{scene.subline}</p></AbsoluteFill></AbsoluteFill>;
}

function Stat({ scene }: { scene: Scene }) {
  const frame = useCurrentFrame(); const { width } = useVideoConfig(); const p = useEnter(0, scene.speed);
  const drift = interpolate(frame, [0, scene.durationInFrames], [1, 1.06]); const size = width * 0.22;
  return <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, textAlign: "center" }}><div style={{ fontSize: size, fontWeight: 800, color: scene.accent, transform: `scale(${p * drift})`, lineHeight: 1 }}>{scene.headline}</div><div style={{ fontSize: size * 0.16, color: scene.foreground, opacity: p, marginTop: size * 0.1 }}>{scene.subline}</div></AbsoluteFill>;
}

function LogoReveal({ scene }: { scene: Scene }) {
  const { width } = useVideoConfig(); const ring = useEnter(0, scene.speed); const text = useEnter(10, scene.speed); const s = width * 0.12; const [a, ...rest] = scene.headline.split(" ");
  return <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, gap: s * 0.3 }}><div style={{ width: s, height: s, borderRadius: "50%", border: `${s * 0.08}px solid ${scene.accent}`, transform: `scale(${ring}) rotate(${(1 - ring) * -90}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 0, height: 0, borderTop: `${s * 0.18}px solid transparent`, borderBottom: `${s * 0.18}px solid transparent`, borderLeft: `${s * 0.28}px solid ${scene.accent}`, marginLeft: s * 0.06 }} /></div><div style={{ fontSize: s * 0.5, fontWeight: 800, letterSpacing: "0.04em", clipPath: `inset(0 ${(1 - text) * 100}% 0 0)` }}><span style={{ color: scene.foreground }}>{a} </span><span style={{ color: scene.accent }}>{rest.join(" ")}</span></div><div style={{ fontSize: s * 0.18, color: scene.foreground, opacity: text * 0.6 }}>{scene.subline}</div></AbsoluteFill>;
}

function Cube({ color }: { color: string }) {
  const face: React.CSSProperties = { position: "absolute", width: "100%", height: "100%", border: "1px solid rgba(255,255,255,.45)", background: color, opacity: 0.88, backfaceVisibility: "hidden" };
  return <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
    <div style={{ ...face, transform: "translateZ(50%)" }} />
    <div style={{ ...face, transform: "rotateY(180deg) translateZ(50%)", filter: "brightness(.65)" }} />
    <div style={{ ...face, transform: "rotateY(90deg) translateZ(50%)", filter: "brightness(.82)" }} />
    <div style={{ ...face, transform: "rotateY(-90deg) translateZ(50%)", filter: "brightness(.72)" }} />
    <div style={{ ...face, transform: "rotateX(90deg) translateZ(50%)", filter: "brightness(1.2)" }} />
    <div style={{ ...face, transform: "rotateX(-90deg) translateZ(50%)", filter: "brightness(.55)" }} />
  </div>;
}

function MotionLayer({ layer, scene }: { layer: Layer; scene: Scene }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = useEnter(layer.delay, scene.speed);
  const progress = interpolate(frame - layer.delay, [0, Math.max(1, layer.duration)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const pulse = 1 + Math.sin(frame / 9) * 0.035;
  let transform = `translate(-50%, -50%) translateZ(${layer.depth}px) rotate(${layer.rotation}deg)`;
  if (layer.motion === "rise") transform += ` translateY(${(1 - p) * 90}px)`;
  if (layer.motion === "drop") transform += ` translateY(${(1 - p) * -90}px)`;
  if (layer.motion === "slide-left") transform += ` translateX(${(1 - p) * 140}px)`;
  if (layer.motion === "slide-right") transform += ` translateX(${(1 - p) * -140}px)`;
  if (layer.motion === "scale") transform += ` scale(${p})`;
  if (layer.motion === "rotate" || layer.motion === "orbit") transform += ` rotateY(${progress * 360}deg) rotateX(${progress * 180}deg)`;
  if (layer.motion === "float") transform += ` translateY(${Math.sin(frame / 12) * 22}px) rotateY(${Math.sin(frame / 20) * 18}deg)`;
  if (layer.motion === "pulse") transform += ` scale(${pulse})`;
  if (layer.motion === "reveal") transform += ` scaleX(${p})`;
  const style: React.CSSProperties = {
    position: "absolute", left: `${layer.x}%`, top: `${layer.y}%`, width: `${layer.width}%`, height: `${layer.height}%`,
    opacity: layer.opacity * p, transform, transformStyle: "preserve-3d", perspective: 900,
    color: layer.color, fontFamily: FONT, fontSize: `min(${layer.fontSize / 1080 * width}px, ${layer.fontSize / 1920 * height}px)`,
    fontWeight: Number(layer.weight), display: "flex", alignItems: "center", justifyContent: "center",
    textAlign: "center", boxSizing: "border-box", willChange: "transform, opacity",
  };
  const common = { style: { ...style, background: layer.color, borderRadius: layer.type === "circle" || layer.type === "sphere" ? "50%" : layer.type === "ring" ? "50%" : layer.radius, ...(layer.type === "ring" ? { background: "transparent", border: `max(2px, ${Math.min(width, height) * 0.004}px) solid ${layer.color}` } : {}) } as React.CSSProperties };
  if (layer.type === "text") return <div style={{ ...style, textShadow: "0 8px 28px rgba(0,0,0,.25)", whiteSpace: "pre-wrap", lineHeight: 1.05 }}>{layer.text ?? scene.headline}</div>;
  if (layer.type === "cube") return <div style={{ ...style, width: `${layer.width}%`, height: `${layer.width}%`, background: "transparent", transform: `${transform} rotateX(-24deg) rotateY(34deg)` }}><Cube color={layer.color} /></div>;
  if (layer.type === "sphere") return <div style={{ ...style, borderRadius: "50%", background: `radial-gradient(circle at 30% 25%, #ffffff, ${layer.color} 38%, #111827 100%)`, boxShadow: `0 0 55px ${layer.color}66, inset -12px -16px 28px #0008` }} />;
  if (layer.type === "line") return <div style={{ ...style, height: Math.max(2, height * 0.003), background: layer.color, transform: `${transform} scaleX(${p})`, transformOrigin: "left center" }} />;
  if (layer.type === "grid") return <div style={{ ...style, background: `linear-gradient(${layer.color}33 1px, transparent 1px), linear-gradient(90deg, ${layer.color}33 1px, transparent 1px)`, backgroundSize: "24px 24px", maskImage: "linear-gradient(transparent, black, transparent)" }} />;
  if (layer.type === "particle") return <div style={{ ...style, width: Math.max(4, width * layer.width / 100 * 0.18), height: Math.max(4, width * layer.width / 100 * 0.18), borderRadius: "50%", boxShadow: `0 0 22px 5px ${layer.color}88` }} />;
  return <div {...common} />;
}

function MotionScene({ scene }: { scene: Scene }) {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ fontFamily: FONT, perspective: 1200, transformStyle: "preserve-3d" }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${scene.accent}22 0%, transparent 62%)` }} />
    {scene.layers.map((layer) => <MotionLayer key={layer.id} layer={layer} scene={scene} />)}
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.08, backgroundImage: "radial-gradient(#ffffff 0.7px, transparent 0.7px)", backgroundSize: "5px 5px", mixBlendMode: "screen" }} />
  </AbsoluteFill>;
}

const TEMPLATES = { "kinetic-title": KineticTitle, "split-reveal": SplitReveal, stat: Stat, "logo-reveal": LogoReveal };

export function MotionVideo({ storyboard }: { storyboard: Storyboard }) {
  let from = 0;
  return <AbsoluteFill style={{ background: "#080A12" }}>
    {storyboard.scenes.map((scene) => {
      const seq = <Sequence key={scene.id} from={from} durationInFrames={scene.durationInFrames}>
        <TransitionWrap scene={scene}>
          {scene.template === "motion-scene" ? <MotionScene scene={scene} /> : (() => { const C = TEMPLATES[scene.template as keyof typeof TEMPLATES] ?? KineticTitle; return <C scene={scene} />; })()}
        </TransitionWrap>
      </Sequence>;
      from += scene.durationInFrames;
      return seq;
    })}
  </AbsoluteFill>;
}
