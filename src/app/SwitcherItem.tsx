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
}: SwitcherItemProps) {
  const className = clsx(
    'flex items-center justify-center',
    'w-10 h-10 rounded-full',
    'text-red-500 hover:text-red-300 transition-colors',
    active && 'text-red-400',
    !noPadding && 'p-2'
  );

  const content = text ? (
    <span className="text-sm">{text}</span>
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