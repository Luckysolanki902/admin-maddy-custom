import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectToDatabase } from './lib/db';

const isProtectedRoute = createRouteMatcher(['/admin(.*)', ]);

export default clerkMiddleware(async (auth, req) => {
  const { nextUrl } = req;
  const currentPath = nextUrl.pathname;
  
  if (isProtectedRoute(req)) {
    const { sessionClaims } = await auth();

    const userRole = sessionClaims?.metadata?.role;
    console.log(userRole)

    const res = await fetch(`http://localhost:3000/api/authentication/check-role-access?pathname=${currentPath}&role=${userRole}`);
    const { allowed } = await res.json();

  if (!allowed) {
    return NextResponse.redirect('http://localhost:3000/');
  }

  return NextResponse.next();
  }
    
  return NextResponse.next();
});


export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

