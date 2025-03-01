const INTRINSIC_WIDTH = 28;
const INTRINSIC_HEIGHT = 28;

export default function IconContact({
  width = INTRINSIC_WIDTH,
  includeTitle = true,
}: {
  width?: number;
  includeTitle?: boolean;
}) {
  return (
    <svg
      width={width}
      height={INTRINSIC_HEIGHT * width / INTRINSIC_WIDTH}
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="hover:opacity-75 transition-opacity"
    >
      {includeTitle && <title>Contato</title>}

      <path
        d="M22 7L14 15L6 7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 7H24V20C24 20.5523 23.5523 21 23 21H5C4.44772 21 4 20.5523 4 20V7Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}