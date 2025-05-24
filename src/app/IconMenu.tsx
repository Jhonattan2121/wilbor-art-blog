const INTRINSIC_WIDTH = 28;
const INTRINSIC_HEIGHT = 24;

export default function IconMenu({
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
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-500 hover:opacity-75 transition-opacity"
        >
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
    );
}