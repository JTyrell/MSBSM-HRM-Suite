import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MSBM-HR Suite | AI-Powered Human Resource Management",
  description: "Next-generation AI-agentic HRM suite with geofenced attendance, automated payroll, and intelligent compliance monitoring.",
  keywords: ["HRM", "Human Resources", "Payroll", "Attendance", "Geofence", "AI", "MSBM"],
  authors: [{ name: "MSBM Group" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "MSBM-HR Suite",
    description: "AI-Powered Human Resource Management System",
    siteName: "MSBM-HR Suite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MSBM-HR Suite",
    description: "AI-Powered Human Resource Management System",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
