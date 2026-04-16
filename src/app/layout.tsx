import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: {
    default: "JobExam - Jobs, Exams & Campus Placements",
    template: "%s | JobExam",
  },
  description:
    "Your one-stop platform for jobs, competitive exams, and campus placements. Find opportunities, track exams, and connect with your college placement cell.",
  keywords: ["jobs", "exams", "placement", "campus", "students", "careers"],
  authors: [{ name: "JobExam" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "JobExam",
    title: "JobExam - Jobs, Exams & Campus Placements",
    description:
      "Your one-stop platform for jobs, competitive exams, and campus placements.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobExam",
    description:
      "Your one-stop platform for jobs, competitive exams, and campus placements.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
