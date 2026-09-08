import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Нашата Сватба • Галерия и Трейлър",
  description: "Споделени спомени от сватбения ден — разглеждане, качване и сваляне на снимки.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <body className="min-h-screen bg-[#faf8f5] text-[#2d2621] antialiased">
        {children}
      </body>
    </html>
  );
}
