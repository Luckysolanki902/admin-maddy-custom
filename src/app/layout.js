import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes'
import ThemeRegistry from "@/components/layout/ThemeRegistry";
import AuthHeader from "@/components/layout/AuthHeader";

import { Jost } from 'next/font/google';

const jost = Jost({
  subsets: ['latin'], // Specify character subsets
  weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], // Choose the weights you need
  variable: '--font-jost', // Optional: for CSS variable
  display: 'swap', // Fallback to default fonts while loading
});
export const metadata = {
  title: "Admin Dashboard | Maddy Custom",
  description: "Uniqueness isn't an option, it's a necessity.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}>
      <html lang="en">
        <body>
          <ThemeRegistry>
            <AuthHeader />
            <main>{children}</main>
          </ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
