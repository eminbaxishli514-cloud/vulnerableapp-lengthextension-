import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Length Extension Attack Lab",
  description: "Interactive SHA-256 length extension attack demo for signed payment URLs"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
