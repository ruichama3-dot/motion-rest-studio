import { createServerFn } from "@tanstack/react-start";
import { validateGenerationInput, generateStoryboardWithGemini } from "./generate.server";

export const generateVideoStoryboard = createServerFn({ method: "POST" })
  .validator(validateGenerationInput)
  .handler(async ({ data }) => generateStoryboardWithGemini(data));
