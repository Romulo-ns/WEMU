import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "WEMU - Connect Through Music",
  description: "WEMU is the ultimate social network for music lovers worldwide. Discover new tracks, share your favorite playlists, and connect with a passionate community through the power of music.",
  metadataBase: new URL("https://wemu-production.up.railway.app"),
  openGraph: {
    title: "WEMU - Connect Through Music",
    description: "WEMU is the ultimate social network for music lovers worldwide. Discover new tracks, share your favorite playlists, and connect with a passionate community through the power of music.",
    url: "https://wemu-production.up.railway.app",
    siteName: "WEMU",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WEMU - The ultimate Social Network for music lovers",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WEMU - Connect Through Music",
    description: "WEMU is the ultimate social network for music lovers worldwide. Discover new tracks, share your favorite playlists, and connect with a passionate community through the power of music.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${inter.variable} font-sans flex flex-col min-h-screen`} suppressHydrationWarning>
        <SessionProviderWrapper>
          <Navbar />
          <main className="pt-20 pb-12 flex-grow">
            {children}
          </main>
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
