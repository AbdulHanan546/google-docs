import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ajaia Docs | AI-Native Collaborative Document Editor",
  description:
    "Lightweight collaborative document editor inspired by Google Docs, featuring native AI assistance, markdown imports, and role-based sharing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased`}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
