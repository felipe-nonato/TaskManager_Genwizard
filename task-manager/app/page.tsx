'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
            router.push('/login')
        } else {
            setUser(JSON.parse(storedUser))
        }
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem('user')
        router.push('/login')
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="border-2 border-black p-8">
                    <p className="text-black font-bold uppercase">
                        CARREGANDO...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="border-2 border-black p-8 mb-8 bg-white relative">
                    <div className="absolute top-4 right-4 w-2 h-2 bg-red-600 rounded-full animate-pulse" />

                    <h1 className="text-4xl font-bold text-black uppercase tracking-wider mb-2">
                        DASHBOARD
                    </h1>
                    <div className="w-16 h-1 bg-black mb-6" />

                    <div className="space-y-2">
                        <p className="text-sm text-black opacity-70 uppercase">
                            BEM-VINDO(A),
                        </p>
                        <p className="text-2xl font-bold text-black uppercase">
                            {user.name}
                        </p>
                    </div>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="border-2 border-black p-6 bg-white">
                        <p className="text-xs font-bold text-black mb-2 uppercase tracking-wide opacity-60">
                            EMAIL
                        </p>
                        <p className="text-lg font-bold text-black break-all">
                            {user.email}
                        </p>
                    </div>

                    <div className="border-2 border-black p-6 bg-white">
                        <p className="text-xs font-bold text-black mb-2 uppercase tracking-wide opacity-60">
                            ID DO USUÁRIO
                        </p>
                        <p className="text-lg font-bold text-black">
                            #{user.id.toString().padStart(4, '0')}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-2 border-black p-8 bg-white">
                    <h2 className="text-xl font-bold text-black uppercase tracking-wide mb-6">
                        AÇÕES
                    </h2>

                    <div className="space-y-4">
                        <button
                            onClick={() => router.push('/create-ticket')}
                            className="w-full bg-black hover:bg-red-600 text-white font-bold py-4 uppercase tracking-wider transition-all duration-200 border-2 border-black hover:border-red-600"
                        >
                            CRIAR TICKET
                        </button>

                        <button
                            onClick={() => router.push('/tickets')}
                            className="w-full border-2 border-black hover:bg-black hover:text-white text-black font-bold py-4 uppercase tracking-wider transition-all duration-200"
                        >
                            VER TICKETS
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 uppercase tracking-wider transition-all duration-200 border-2 border-red-600 hover:border-red-700"
                        >
                            SAIR
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                        <p className="text-xs text-black opacity-60 uppercase tracking-wider">
                            Felipe Nonato • 2025
                        </p>
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}
