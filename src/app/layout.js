import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ThemeRegistry from "@/components/layout/ThemeRegistry";
import AuthHeader from "@/components/layout/AuthHeader";

export const metadata = {
  title: "Maddy Custom Admin Dashboard",
  description: "Effortlessly manage products, orders, and store settings with Maddy Custom Admin Dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
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
