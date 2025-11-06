'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import apiService from '../../services/api'

export default function CreateTicket() {
    const [priority, setPriority] = useState('')
    const [label, setLabel] = useState('')
    const [description, setDescription] = useState('')
    const [value, setValue] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setResult(null)
        setLoading(true)

        try {
            const response = await apiService.createTicket({
                priority,
                label,
                description,
                value,
            })

            setResult(response)
        } catch (err: any) {
            setError(err.message || 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
            <div className="w-full max-w-2xl border-2 border-black p-8 bg-white relative">
                <div className="absolute top-4 right-4 w-2 h-2 bg-red-600 rounded-full animate-pulse" />

                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold uppercase tracking-wider">
                            CRIAR TICKET
                        </h2>
                        <div className="w-16 h-1 bg-black" />
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className="border-2 border-black hover:bg-black hover:text-white px-4 py-2 uppercase font-bold transition-colors text-sm"
                    >
                        VOLTAR
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-4 mt-6"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            required
                            className="border-2 border-black p-2 uppercase"
                        >
                            <option value="">SELECIONE PRIORIDADE</option>
                            <option value="1">1 - CRÍTICO</option>
                            <option value="2">2 - ALTO</option>
                            <option value="3">3 - MÉDIO</option>
                            <option value="4">4 - BAIXO</option>
                        </select>

                        <input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="TÍTULO DO TICKET"
                            required
                            className="border-2 border-black p-2 uppercase placeholder:text-gray-400"
                        />
                    </div>

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="DESCRIÇÃO DETALHADA DO PROBLEMA"
                        rows={4}
                        className="border-2 border-black p-2 placeholder:text-gray-400"
                    />

                    <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="DESCRIÇÂO CURTA DO PROBLEMA"
                        className="border-2 border-black p-2 uppercase placeholder:text-gray-400"
                    />

                    {error && (
                        <div className="border-2 border-red-600 p-4 bg-white">
                            <p className="text-red-600 font-bold uppercase">
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-black hover:bg-red-600 text-white px-6 py-3 uppercase font-bold transition-colors border-2 border-black hover:border-red-600 disabled:opacity-50"
                        >
                            {loading ? 'ENVIANDO...' : 'ENVIAR TICKET'}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setPriority('')
                                setLabel('')
                                setDescription('')
                                setValue('')
                                setResult(null)
                                setError('')
                            }}
                            className="border-2 border-black hover:bg-black hover:text-white px-6 py-3 uppercase font-bold transition-colors"
                        >
                            LIMPAR
                        </button>
                    </div>

                    {result && (
                        <div className="mt-4 border-2 border-black bg-white p-4">
                            <p className="text-xs font-bold uppercase mb-2 text-green-600">
                                ✓ TICKET ENVIADO COM SUCESSO
                            </p>
                            <pre className="text-xs overflow-auto font-mono bg-gray-50 p-2 border border-gray-300">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
