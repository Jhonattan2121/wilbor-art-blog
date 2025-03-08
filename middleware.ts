import type { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import {
  PATH_ADMIN,
  PATH_ADMIN_PHOTOS,
  PATH_OG,
  PATH_OG_SAMPLE,
  PREFIX_PHOTO,
  PREFIX_TAG,
} from './src/app/paths';
import { auth } from './src/auth';

export function middleware(request: NextRequest) {
  // If on root route, redirect to /projects
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/projects', request.url));
  }

  const pathname = request.nextUrl.pathname;

  // Novo código para rotas /p/
  if (pathname.startsWith('/p/')) {
    const photoId = pathname.split('/').pop();

    if (photoId?.includes('-')) {
      const [author, permlink] = photoId.split('-');
      return NextResponse.rewrite(new URL(`/projects/${author}/${permlink}`, request.url));
    }
  }

  if (pathname === PATH_ADMIN) {
    return NextResponse.redirect(new URL(PATH_ADMIN_PHOTOS, request.url));
  } else if (pathname === PATH_OG) {
    return NextResponse.redirect(new URL(PATH_OG_SAMPLE, request.url));
  } else if (/^\/photos\/(.)+$/.test(pathname)) {
    // Accept /photos/* paths, but serve /p/*
    const matches = pathname.match(/^\/photos\/(.+)$/);
    return NextResponse.rewrite(new URL(
      `${PREFIX_PHOTO}/${matches?.[1]}`,
      request.url,
    ));
  } else if (/^\/t\/(.)+$/.test(pathname)) {
    // Accept /t/* paths, but serve /tag/*
    const matches = pathname.match(/^\/t\/(.+)$/);
    return NextResponse.rewrite(new URL(
      `${PREFIX_TAG}/${matches?.[1]}`,
      request.url,
    ));
  }

  return auth(
    request as unknown as NextApiRequest,
    NextResponse as unknown as NextApiResponse,
  );
}

export async function GET(request: Request) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const url = new URL('/home', baseUrl);

    return NextResponse.json({ url: url.toString() });
  } catch (error) {
    console.error('Error in home-image route:', error);
    return NextResponse.json({ error: 'Invalid URL configuration' }, { status: 500 });
  }
}

export const config = {
  matcher: [
    '/',
    '/((?!api$|api/auth|_next/static|_next/image|favicon.ico$|favicons/|grid$|feed$|home-image$|template-image$|template-image-tight$|template-url$|$).*)',
  ],
};