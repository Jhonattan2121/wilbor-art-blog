/* eslint-disable max-len */

const INTRINSIC_WIDTH = 28;
const INTRINSIC_HEIGHT = 24;

export default function IconInstagram({
  width = INTRINSIC_WIDTH,
  includeTitle = true,
}: {
  width?: number
  includeTitle?: boolean
}) {
  return (
    <svg
      width={width}
      height={INTRINSIC_HEIGHT * width / INTRINSIC_WIDTH}
      viewBox="0 0 28 29"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="hover:opacity-75 transition-opacity"
    >
      {includeTitle && <title>Instagram</title>}
      <rect x="4" y="4" width="20" height="20" rx="6" strokeWidth="1.5" />
      <circle cx="14" cy="14" r="5" strokeWidth="1.5" />
      <circle cx="20" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}
