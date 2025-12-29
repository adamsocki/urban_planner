import * as React from "react";

/**
 * Planner wordmark SVG component
 * Simple text-based logo that displays "Planner" in a clean, readable font
 */
function SvgPlanner(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text
        x="0"
        y="26"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="28"
        fontWeight="600"
        fill="currentColor"
      >
        Planner
      </text>
    </svg>
  );
}

export default SvgPlanner;
