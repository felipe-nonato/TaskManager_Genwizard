'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import apiService from '@/services/api'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isLogin) {
                // Login
                const data = await apiService.login({ email, password })
                localStorage.setItem('user', JSON.stringify(data.user))
                router.push('/')
            } else {
                // Cadastro
                await apiService.register({ name, email, password })
                setIsLogin(true)
                setName('')
                setPassword('')
                setError('Cadastro realizado com sucesso! Faça login.')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="w-full max-w-md">
                <div className="border-2 border-black p-8 bg-white relative">
                    {/* Dot decorativo estilo Nothing */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-red-600 rounded-full animate-pulse" />

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-black mb-2 uppercase tracking-wider">
                            {isLogin ? 'LOGIN' : 'REGISTRO'}
                        </h1>
                        <div className="w-12 h-1 bg-black" />
                        <p className="text-sm text-black mt-4 opacity-70">
                            {isLogin
                                ? 'ACESSE SUA CONTA'
                                : 'CRIE UMA NOVA CONTA'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-xs font-bold text-black mb-2 uppercase tracking-wide"
                                >
                                    NOME COMPLETO
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required={!isLogin}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-black bg-white text-black focus:outline-none focus:border-red-600 transition-colors font-mono"
                                    placeholder="JOÃO SILVA"
                                />
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs font-bold text-black mb-2 uppercase tracking-wide"
                            >
                                EMAIL
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-black bg-white text-black focus:outline-none focus:border-red-600 transition-colors font-mono"
                                placeholder="SEU@EMAIL.COM"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs font-bold text-black mb-2 uppercase tracking-wide"
                            >
                                SENHA
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-black bg-white text-black focus:outline-none focus:border-red-600 transition-colors font-mono"
                                placeholder="••••••••"
                                minLength={6}
                            />
                            {!isLogin && (
                                <p className="mt-2 text-xs text-black opacity-60">
                                    MÍNIMO 6 CARACTERES
                                </p>
                            )}
                        </div>

                        {error && (
                            <div
                                className={`p-4 border-2 ${
                                    error.includes('sucesso')
                                        ? 'bg-white border-green-600 text-green-600'
                                        : 'bg-white border-red-600 text-red-600'
                                }`}
                            >
                                <p className="text-xs font-bold uppercase">
                                    {error}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black hover:bg-red-600 text-white font-bold py-4 uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black hover:border-red-600"
                        >
                            {loading
                                ? 'PROCESSANDO...'
                                : isLogin
                                  ? 'ENTRAR'
                                  : 'CRIAR CONTA'}
                        </button>
                    </form>

                    {/* Toggle entre Login e Cadastro */}
                    <div className="mt-6 text-center">
                        <p className="text-black text-sm">
                            {isLogin ? 'NÃO TEM CONTA?' : 'JÁ TEM CONTA?'}{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin)
                                    setError('')
                                    setName('')
                                    setEmail('')
                                    setPassword('')
                                }}
                                className="text-black font-bold hover:text-red-600 underline uppercase transition-colors"
                            >
                                {isLogin ? 'CADASTRE-SE' : 'FAÇA LOGIN'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer minimalista */}
                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                        <p className="text-xs text-black opacity-60 uppercase tracking-wider">
                            SECURE • BCRYPT
                        </p>
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}
