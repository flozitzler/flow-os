import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-OS | Command Center",
  description: "Your premium AI Operating System — mission control for agents, pipelines, and content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-background text-foreground">
        <Sidebar />
        <div className="flex flex-1 flex-col ml-[240px] transition-all duration-300">
          <Header />
          <main className="flex-1 overflow-auto bg-grid">{children}</main>
        </div>
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#1B2D45",
              border: "1px solid rgba(196,162,90,0.15)",
              color: "#E8E6E3",
            },
          }}
        />
      </body>
    </html>
  );
}
