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
      className="px-4 py-2 text-red-500 hover:text-red-300 transition-colors text-sm font-medium"
    >
      {text}
    </Link>
  );
} 