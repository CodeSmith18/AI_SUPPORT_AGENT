import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spur AI Live Chat Agent",
  description: "Mini AI support chat agent for the Spur take-home assignment"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
