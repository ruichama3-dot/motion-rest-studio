import { describe, expect, it } from "vitest";
import { CATEGORIES, defaultBrief, validateBrief, validateUpload, styleStoryboard, STYLE_NAMES } from "./production";
import { parseStoryboard } from "./storyboard";
describe("Production rules", () => {
  it.each(CATEGORIES)("requires category-specific name and description for $id", c => {
    const b = { ...defaultBrief(), category: c.id };
    expect(validateBrief(b)).toHaveLength(2);
    b.fields = { name: "Exemplo", description: "Dados confirmados" };
    expect(validateBrief(b)).toEqual([]);
  });
  it("accepts a 50 MB image and rejects larger files", () => {
    expect(validateUpload({ size: 50 * 1024 * 1024, type: "image/png" })).toBeNull();
    expect(validateUpload({ size: 50 * 1024 * 1024 + 1, type: "image/png" })).not.toBeNull();
  });
  it("rejects executable uploads", () => expect(validateUpload({size: 100, type: "application/javascript"})).not.toBeNull());
  it.each(STYLE_NAMES)("renders validated scenes for %s", style => expect(parseStoryboard(styleStoryboard(style)).success).toBe(true));
});