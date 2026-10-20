import { describe, expect, it } from "vitest";
import { parseStoryboard, starterStoryboard, totalFrames } from "./storyboard";

describe("storyboard rules", () => {
  it("accepts the starter storyboard", () => {
    expect(parseStoryboard(starterStoryboard()).success).toBe(true);
  });

  it("rejects templates outside the approved catalog", () => {
    const sb = starterStoryboard();
    (sb.scenes[0]! as { template: string }).template = "eval-code";
    expect(parseStoryboard(sb).success).toBe(false);
  });

  it("rejects a scene shorter than 1 second", () => {
    const sb = starterStoryboard();
    sb.scenes[0]!.durationInFrames = 29;
    expect(parseStoryboard(sb).success).toBe(false);
  });

  it("rejects a scene longer than 15 seconds", () => {
    const sb = starterStoryboard();
    sb.scenes[0]!.durationInFrames = 451;
    expect(parseStoryboard(sb).success).toBe(false);
  });

  it("rejects more than 12 scenes", () => {
    const sb = starterStoryboard();
    sb.scenes = Array.from({ length: 13 }, (_, i) => ({ ...sb.scenes[0]!, id: `x${i}`, durationInFrames: 60 }));
    expect(parseStoryboard(sb).success).toBe(false);
  });

  it("rejects a total above 90 seconds", () => {
    const sb = starterStoryboard();
    sb.scenes = Array.from({ length: 7 }, (_, i) => ({ ...sb.scenes[0]!, id: `x${i}`, durationInFrames: 400 }));
    expect(totalFrames(sb.scenes)).toBe(2800);
    expect(parseStoryboard(sb).success).toBe(false);
  });
});
