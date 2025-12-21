import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Interval Timer',
  description: 'A simple interval timer with bell notifications',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="overflow-x-hidden">{children}</body>
    </html>
  )
}