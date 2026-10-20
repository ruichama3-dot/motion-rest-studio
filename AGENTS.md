<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Videos are described by a zod-validated storyboard JSON (`src/lib/storyboard.ts`) rendered by approved Remotion scene templates (`src/remotion/`); AI must only fill this schema, never produce executable code — safety and predictable rendering.
- Remotion Player is loaded only on the client (lazy import, `/app` routes have `ssr: false`) — it is browser-only.
- Project data is read/written from the browser with the Cloud client under per-user RLS; privileged work (AI, TTS, render jobs) goes through authenticated server functions — keys never reach the browser.
- MP4 rendering cannot run on the app's edge server (no Chromium/FFmpeg); it must run on an external Remotion-compatible renderer.
