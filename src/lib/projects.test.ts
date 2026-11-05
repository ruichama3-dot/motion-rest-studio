import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: mocks.getUser }, from: mocks.from } }));
import { createProject, getProject } from "./projects";

describe("Project access", () => {
  beforeEach(() => vi.clearAllMocks());
  it("requires login before creating a video", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(createProject("Vídeo")).rejects.toThrow("Entre na sua conta para criar um vídeo.");
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("rejects an invalid project ID without requesting project data", async () => {
    await expect(getProject("undefined")).rejects.toThrow("Projeto indisponível");
    expect(mocks.from).not.toHaveBeenCalled();
  });
});