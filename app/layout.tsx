import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./font.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const lato = localFont({
  src: "./fonts/Lato-Regular.ttf",
  variable: "--font-lato-regular",
  weight: "100 900",
});
export const metadata: Metadata = {
  title: "Splitify",
  description: "Split your large Spotify playlists!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lato.variable} ${lato.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
