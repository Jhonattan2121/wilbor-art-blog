const INTRINSIC_WIDTH = 28;
const INTRINSIC_HEIGHT = 28;

export default function IconContacts({
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
      {includeTitle && <title>Contatos</title>}
      {/* Base do livro de contatos */}
      <rect x="4" y="4" width="20" height="20" rx="2" strokeWidth="2" />
      {/* Ícone de pessoa */}
      <circle cx="14" cy="11" r="3" strokeWidth="2" />
      {/* Corpo da pessoa */}
      <path 
        d="M8 19C8 16.2386 10.2386 14 14 14C17.7614 14 20 16.2386 20 19"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}