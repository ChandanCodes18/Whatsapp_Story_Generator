import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsApp Story Generator",
  description: "Create realistic WhatsApp chat mockups and export them as animated videos or high-resolution screenshots.",
  keywords: ["whatsapp", "chat", "mockup", "generator", "video", "story", "screenshot"],
  authors: [{ name: "WhatsApp Story Generator" }],
  openGraph: {
    title: "WhatsApp Story Generator",
    description: "Create realistic WhatsApp chat mockups and export them as animated videos or high-resolution screenshots.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
