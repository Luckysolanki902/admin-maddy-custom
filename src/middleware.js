

// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
// import { NextResponse } from 'next/server';

// // Create route matcher for admin routes
// const isProtectedRoute = createRouteMatcher(['/admin(.*)', ]);

// export default clerkMiddleware(async (auth, req) => {
//   const { nextUrl } = req;
//   const currentPath = nextUrl.pathname;
//   console.log(currentPath)
  

//   if (isProtectedRoute(req)) {
//     const { sessionClaims } = await auth();

//     const userRole = sessionClaims?.metadata?.role;
//     console.log(userRole)

//     const rolePaths = {
//       developer: '/admin/dev',
//       marketing: '/admin/market',
//       admin:'/admin'
//     };

//     if ((userRole === 'developer' || userRole === 'admin') && currentPath.startsWith(rolePaths.developer)) {
//       // return NextResponse.redirect('http://localhost:3000/admin/dev');
//       console.log("sdgsdg")
//       return NextResponse.next();
//     } else if ((userRole === 'marketing' || userRole === 'admin') && currentPath.startsWith(rolePaths.marketing)) {
//       // return NextResponse.redirect('http://localhost:3000/admin/market');
//       return NextResponse.next();
//     } else if (userRole === 'admin' && currentPath.startsWith(rolePaths.admin)) {
//       // return NextResponse.redirect('http://localhost:3000/admin')
//       return NextResponse.next();
//     } else if (!rolePaths[userRole] && currentPath !== '/') {
//       return NextResponse.redirect('http://localhost:3000/');
//     }
//     else
//      return NextResponse.redirect('http://localhost:3000/')
//   }

//   // If no redirection is needed, continue to the next middleware or route
//   return NextResponse.next();
// });


// export const config = {
//   matcher: [
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     '/(api|trpc)(.*)', // Always run for API routes
//   ],
// };







import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectToDatabase } from './lib/db';
// import AccessControl from "@/models/routeSchema";


// Create route matcher for admin routes
const isProtectedRoute = createRouteMatcher(['/admin(.*)', ]);

export default clerkMiddleware(async (auth, req) => {
  const { nextUrl } = req;
  const currentPath = nextUrl.pathname;
  console.log(currentPath)
  
  // await connectToDatabase();
  // console.log('MongoDB connected:', mongoose.connection.readyState);
  if (isProtectedRoute(req)) {
    const { sessionClaims } = await auth();

    const userRole = sessionClaims?.metadata?.role;
    console.log(userRole)

   
    // const pathData=await AccessControl.findOne({pathname:currentPath})
    // console.log(pathData)

    // // Check if path exists in DB
    // if (!pathData) {
    //   console.log(`Path not found in DB: ${currentPath}`);
    //   return NextResponse.redirect('http://localhost:3000/'); // Redirect if path not found
    // }

    // // Check if the user's role is allowed for this path
    // const allowedRoles = pathData.rolesAllowed || [];
    // if (allowedRoles.includes(userRole)) {
    //   // If the role is allowed, continue
    //   return NextResponse.next();
    // } else {
    //   // If the role is not allowed, redirect to home
    //   console.log(`User role "${userRole}" not allowed for this path`);
    //   return NextResponse.redirect('http://localhost:3000/'); // Redirect if role not allowed
    // }

    const res = await fetch(`http://localhost:3000/api/check-role-access?pathname=${currentPath}&role=${userRole}`);
    const { allowed } = await res.json();

  if (!allowed) {
    return NextResponse.redirect('http://localhost:3000/');
  }

  return NextResponse.next();
  }
    
  // If no redirection is needed, continue to the next middleware or route
  return NextResponse.next();
});


export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)', // Always run for API routes
  ],
};

