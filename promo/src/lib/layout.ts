import { useVideoConfig } from "remotion";

/** Reflow helper: scenes branch on `vertical` and pick sizes per format. */
export function useLayout() {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return {
    width,
    height,
    vertical,
    /** Side gutter: wide gets cinematic margins, vertical keeps clear of TikTok/X UI. */
    padX: vertical ? 80 : 140,
    padY: vertical ? 200 : 90,
    pick: <T>(wide: T, tall: T): T => (vertical ? tall : wide),
  };
}

export type Layout = ReturnType<typeof useLayout>;
