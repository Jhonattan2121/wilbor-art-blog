import Link from 'next/link';

interface SocialLinkProps {
  text: string;
  href: string;
  target?: string;
  rel?: string;
}

export default function SocialLink({
  text,
  href,
  target,
  rel,
}: SocialLinkProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className="inline-block text-center px-2 py-2 text-red-500 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 transition-colors text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 truncate"
    >
      {text}
    </Link>
  );
} 