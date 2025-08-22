import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/contexts/AppContext'
import { AuthProvider } from '@/contexts/AuthContext'

import BrowserExtensionSuppressor from '@/components/utils/BrowserExtensionSuppressor'
import DevServiceWorkerGuard from '@/components/utils/DevServiceWorkerGuard'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinanceAI - Smart Financial Management',
  description: 'AI-powered financial management dashboard',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FinanceAI',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6366f1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <BrowserExtensionSuppressor />
        <DevServiceWorkerGuard />
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
