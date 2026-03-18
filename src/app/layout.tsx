import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "WEMU - Connect Through Music",
  description: "A Spotify-integrated social network for music lovers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${inter.variable} font-sans`}>
        <SessionProviderWrapper>
          <Navbar />
          <main className="pt-20 pb-12">
            {children}
          </main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
