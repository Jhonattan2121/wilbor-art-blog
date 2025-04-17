import { clsx } from 'clsx/lite';
import Link from 'next/link';
import { ReactNode } from 'react';

interface SwitcherItemProps {
  text?: string;
  icon?: ReactNode;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  target?: string;
  rel?: string;
  noPadding?: boolean;
  fullWidth?: boolean;
}

export default function SwitcherItem({
  text,
  icon,
  href,
  active,
  onClick,
  target,
  rel,
  noPadding,
  fullWidth,
}: SwitcherItemProps) {
  const className = clsx(
    'flex items-center justify-center',
    icon ? 'w-10 h-10 rounded-full' : 'px-2.5 py-1.5 rounded-md whitespace-nowrap',
    'text-red-500 hover:text-red-300 transition-colors',
    'hover:bg-gray-100 dark:hover:bg-gray-800',
    active && 'text-red-400 font-medium bg-gray-50 dark:bg-gray-900',
    fullWidth && 'w-full justify-start',
    !noPadding && (icon ? 'p-2' : 'p-0.5')
  );

  const content = text ? (
    <span className={icon ? "text-sm" : "text-sm sm:text-base"}>
      {text}
    </span>
  ) : icon;

  if (href) {
    return (
      <Link href={href} className={className} target={target} rel={rel}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
} 