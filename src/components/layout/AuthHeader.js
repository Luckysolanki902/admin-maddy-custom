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
        <SignInButton
          style={{
            backgroundColor: "#007bff", // Vibrant blue background
            color: "white", // White text
            padding: "12px 20px", // Button padding
            borderRadius: "4px", // Rounded corners
            fontSize: "16px", // Font size
            border: "none", // Remove default border
            cursor: "pointer", // Pointer cursor on hover
            margin: "10px", // Margin for spacing
          }}
        >
          Sign In
        </SignInButton>
      </SignedOut>
      <SignedIn>
        {/* <UserButton /> */}
      </SignedIn>
    </header>
  );
}
