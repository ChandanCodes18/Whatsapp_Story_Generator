import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create | WhatsApp Story Generator",
  description: "Design and export realistic WhatsApp chat mockup videos and screenshots.",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
