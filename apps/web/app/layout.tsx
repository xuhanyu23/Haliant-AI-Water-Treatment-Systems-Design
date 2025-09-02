import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Water Systems - Professional Water Treatment Design',
  description: 'Engineering-grade water treatment system design tools with deterministic calculations and AI enhancement',
  keywords: 'water treatment, CIP, reverse osmosis, ultrafiltration, ion exchange, engineering design',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">
        {children}
      </body>
    </html>
  )
}
