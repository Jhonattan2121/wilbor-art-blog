/* eslint-disable max-len */

const INTRINSIC_WIDTH = 28;
const INTRINSIC_HEIGHT = 28; // Ajustado para manter proporção quadrada

export default function IconShop({
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
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="hover:opacity-75 transition-opacity"
    >
      {includeTitle && <title>Loja</title>}
      <path
        d="M11 7C11 5.89543 11.8954 5 13 5H15C16.1046 5 17 5.89543 17 7V9H11V7Z"
        strokeWidth="1.5"
      />
      <rect
        x="7"
        y="9"
        width="14"
        height="12"
        rx="2"
        strokeWidth="1.5"
      />
    </svg>
  );
}