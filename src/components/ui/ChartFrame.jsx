"use client";

import { ResponsiveContainer } from "recharts";

/**
 * THE SPARKLINE BUG, AND WHY THIS COMPONENT EXISTS.
 *
 * Recharts' ResponsiveContainer measures its parent, then renders an SVG to
 * fill it. If the parent's size is itself derived from its children, you get a
 * feedback loop: SVG renders -> parent grows -> observer fires -> SVG renders
 * bigger -> ... The chart stretches down the page forever, which is exactly
 * what happened in the HTML mockup.
 *
 * Three things break that loop, and all three are required:
 *
 *   1. HEIGHT IS RESOLVED, NEVER INHERITED.
 *      The wrapper gets an explicit pixel height. ResponsiveContainer with
 *      height="100%" then has something concrete to measure. Never give the
 *      wrapper `height: auto` or a percentage that resolves against an
 *      auto-height ancestor.
 *
 *   2. min-width: 0.
 *      This is the one everyone misses. A flex or grid item defaults to
 *      `min-width: auto`, meaning it refuses to shrink below its content's
 *      intrinsic width. The SVG counts as content, so the column can grow but
 *      never shrink — charts blow out their grid cell on window resize and
 *      never recover. `min-w-0` lets the cell shrink back down.
 *
 *   3. overflow: hidden.
 *      A hard stop. Even if a tooltip or axis label overshoots by a pixel
 *      mid-measure, it cannot feed back into the parent's size.
 *
 * Every chart in this app renders through here. Do not call ResponsiveContainer
 * directly elsewhere.
 */
export default function ChartFrame({ height = 260, className = "", children }) {
  return (
    <div
      className={`w-full min-w-0 overflow-hidden ${className}`}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%" debounce={80}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
