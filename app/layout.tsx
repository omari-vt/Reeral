import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "REERAL - Objets perdus au Senegal",
  description: "Retrouvez vos objets perdus au Senegal — La plateforme communautaire de reference",
  openGraph: {
    title: "REERAL - Objets perdus au Senegal",
    description: "Retrouvez vos objets perdus au Senegal",
    url: "https://reeral.vercel.app",
    siteName: "REERAL",
    images: [
      {
        url: "https://reeral.vercel.app/og-image.png",
        width: 1200,
        height: 630,
      }
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}