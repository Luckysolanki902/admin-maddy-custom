"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
export default function AuthHeader() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures this only runs on the client
  }, []);

  if (!isClient) return null; // Prevents SSR from rendering mismatched HTML

  return (
    <header>
      <SignedOut>
      </SignedOut>
      <SignedIn>
        {/* <UserButton /> */}
      </SignedIn>
    </header>
  );
}
