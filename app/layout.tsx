import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Participation Status Check',
  description: 'QR-based attendance system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
