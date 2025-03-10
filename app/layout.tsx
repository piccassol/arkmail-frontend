import type React from "react"
import type { Metadata } from "next"
import { Poppins, Inter } from "next/font/google"
import "./globals.css"

// Load Inter font
const inter = Inter({ subsets: ["latin"] })

// Load Poppins font with correct weight format
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Lovy-tech | Smart Glasses OS",
  description: "Advanced e-OS system for smart glasses with real-time performance tracking",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins`}>{children}</body>
    </html>
  )
}
