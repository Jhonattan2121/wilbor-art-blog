import { SHOULD_PREFETCH_ALL_LINKS } from '@/app/config';
import { clsx } from 'clsx/lite';
import LinkWithLoader from './LinkWithLoader';
import Spinner from './Spinner';

interface SwitcherItemProps {
  icon: React.ReactElement;
  title?: string;
  href?: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  noPadding?: boolean;
  prefetch?: boolean;
  target?: string;
  rel?: string;
}

export default function SwitcherItem({
  icon,
  title,
  href,
  className: classNameProp,
  onClick,
  active,
  noPadding,
  prefetch = SHOULD_PREFETCH_ALL_LINKS,
  target,
  rel,
}: SwitcherItemProps) {
  const className = clsx(
    classNameProp,
    'py-0.5 px-1.5',
    'cursor-pointer',
    'hover:bg-gray-100/60 active:bg-gray-100',
    'dark:hover:bg-gray-900/75 dark:active:bg-gray-900',
    active
      ? 'text-[#c03131] dark:text-[#c03131]'
      : 'text-[#ff9999] dark:text-[#ff6666]',
    active
      ? 'hover:text-[#c03131] dark:hover:text-[#c03131]'
      : 'hover:text-[#c03131] dark:hover:text-[#c03131]',
);

  const renderIcon = () => noPadding
    ? icon
    : <div className="w-[28px] h-[24px] flex items-center justify-center">
      {icon}
    </div>;

  // For external links, use native 'a' tag
  if (href?.startsWith('http')) {
    return (
      <a
        href={href}
        className={className}
        target={target}
        rel={rel}
      >
        {renderIcon()}
      </a>
    );
  }

  return href ? (
    <LinkWithLoader {...{
      title,
      href,
      className,
      prefetch,
      loader: <Spinner />,
      target,
      rel,
    }}>
      {renderIcon()}
    </LinkWithLoader>
  ) : (
    <div {...{ title, onClick, className }}>{renderIcon()}</div>
  );
};
