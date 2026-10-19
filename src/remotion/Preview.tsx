import { Player, type PlayerRef } from "@remotion/player";
import { forwardRef } from "react";
import { FORMATS, FPS, totalFrames, type Storyboard } from "@/lib/storyboard";
import { MotionVideo } from "./MotionVideo";

const Preview = forwardRef<PlayerRef, { storyboard: Storyboard }>(({ storyboard }, ref) => {
  const { width, height } = FORMATS[storyboard.format];
  return (
    <Player
      ref={ref}
      component={MotionVideo}
      inputProps={{ storyboard }}
      durationInFrames={Math.max(1, totalFrames(storyboard.scenes))}
      fps={FPS}
      compositionWidth={width}
      compositionHeight={height}
      controls
      loop
      style={{ width: "100%", height: "100%" }}
    />
  );
});
Preview.displayName = "Preview";
export default Preview;
