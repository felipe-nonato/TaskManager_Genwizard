import type { Metadata } from 'next'
import { Space_Mono, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const spaceMono = Space_Mono({
    weight: ['400', '700'],
    variable: '--font-space-mono',
    subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
    variable: '--font-jetbrains-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'Use cases - Minimalist Auth System',
    description: 'Minimalist authentication system',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="pt-BR">
            <body
                className={`${spaceMono.variable} ${jetbrainsMono.variable} antialiased bg-white text-black`}
            >
                {children}
            </body>
        </html>
    )
}
