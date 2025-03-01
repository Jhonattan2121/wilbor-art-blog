/* eslint-disable max-len */

const INTRINSIC_WIDTH = 28;
const INTRINSIC_HEIGHT = 24;

export default function IconVimeo({
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
      viewBox="0 0 28 26"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="hover:opacity-75 transition-opacity"
    >
      {includeTitle && <title>Vimeo</title>}
      <path
        d="M24 10.5c-.5 4.5-3.5 10.5-8 10.5-3 0-3.5-6.5-5-11-.75-2.25-1.25-2.5-3-1.5l-1-1.25c2.25-2 4.5-4.25 6-4.25 1.75 0 2.5 2 3 4.75.5 3 1 7.25 2 7.25.75 0 2.5-3 2.5-4.25 0-1-.75-1.5-2-1.5.75-2.25 3-4 5.5-2.5z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
