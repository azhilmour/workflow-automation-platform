import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import "@xyflow/react/dist/style.css"
import { ReactFlowProvider } from "@xyflow/react"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Workflow Automation",
  description: "Visual workflow editor",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100`}>
        <ReactFlowProvider>
          {children}
        </ReactFlowProvider>
      </body>
    </html>
  );
}
