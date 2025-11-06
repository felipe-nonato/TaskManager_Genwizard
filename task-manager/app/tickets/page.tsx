'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Ticket {
    id: number
    user_id?: number
    priority: string
    label: string
    description: string
    value: string
    rsource: string
    sub_resource: string
    origin: string
    env: string
    tower: string
    problem_type: string
    event_id?: string
    external_status?: number
    external_response?: any
    atr_response?: any
    created_at: string
    atr_received_at?: string
}

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const router = useRouter()

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    useEffect(() => {
        fetchTickets()
    }, [])

    const fetchTickets = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await fetch(`${API_URL}/tickets`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao buscar tickets')
            }

            setTickets(data.tickets || [])
        } catch (err: any) {
            setError(err.message || 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR')
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case '1':
                return 'text-red-600 font-bold'
            case '2':
                return 'text-orange-600 font-bold'
            case '3':
                return 'text-yellow-600 font-bold'
            case '4':
                return 'text-green-600 font-bold'
            default:
                return 'text-gray-600'
        }
    }

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case '1':
                return 'CRÍTICO'
            case '2':
                return 'ALTO'
            case '3':
                return 'MÉDIO'
            case '4':
                return 'BAIXO'
            default:
                return 'N/A'
        }
    }

    const getStatusColor = (status?: number) => {
        if (!status) return 'text-gray-500'
        if (status >= 200 && status < 300) return 'text-green-600'
        if (status >= 400) return 'text-red-600'
        return 'text-yellow-600'
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="border-2 border-black p-8 bg-white">
                    <div className="animate-pulse">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mb-4"></div>
                        <p className="uppercase font-bold">
                            CARREGANDO TICKETS...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="border-2 border-black p-6 bg-white relative mb-6">
                    <div className="absolute top-4 right-4 w-2 h-2 bg-red-600 rounded-full animate-pulse" />

                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold uppercase tracking-wider">
                                TICKETS
                            </h1>
                            <div className="w-20 h-1 bg-black mt-2" />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => router.push('/')}
                                className="border-2 border-black hover:bg-black hover:text-white px-4 py-2 uppercase font-bold transition-colors"
                            >
                                VOLTAR
                            </button>

                            <button
                                onClick={fetchTickets}
                                className="border-2 border-black hover:bg-black hover:text-white px-4 py-2 uppercase font-bold transition-colors"
                            >
                                ATUALIZAR
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="border-2 border-red-600 p-4 bg-white mb-4">
                            <p className="text-red-600 font-bold uppercase">
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="text-sm text-gray-600 mb-4">
                        Total: {tickets.length} tickets encontrados
                    </div>
                </div>

                {tickets.length === 0 ? (
                    <div className="border-2 border-black p-8 bg-white text-center">
                        <p className="text-gray-600 uppercase">
                            NENHUM TICKET ENCONTRADO
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="border-2 border-black p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => setSelectedTicket(ticket)}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase">
                                            ID
                                        </div>
                                        <div className="font-bold">
                                            #{ticket.id}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-gray-500 uppercase">
                                            Prioridade
                                        </div>
                                        <div
                                            className={getPriorityColor(
                                                ticket.priority
                                            )}
                                        >
                                            {getPriorityText(ticket.priority)}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-gray-500 uppercase">
                                            Status API
                                        </div>
                                        <div
                                            className={getStatusColor(
                                                ticket.external_status
                                            )}
                                        >
                                            {ticket.external_status
                                                ? ticket.external_status
                                                : 'PENDENTE'}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-gray-500 uppercase">
                                            ATR
                                        </div>
                                        <div
                                            className={
                                                ticket.atr_response
                                                    ? 'text-green-600 font-bold'
                                                    : 'text-gray-500'
                                            }
                                        >
                                            {ticket.atr_response
                                                ? 'RESPONDIDO'
                                                : 'SEM RESPOSTA'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <div className="text-xs text-gray-500 uppercase">
                                        Criado em
                                    </div>
                                    <div className="text-sm">
                                        {formatDate(ticket.created_at)}
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <div className="text-xs text-gray-500 uppercase">
                                        Título
                                    </div>
                                    <div className="font-bold truncate">
                                        {ticket.label}
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <div className="text-xs text-gray-500 uppercase">
                                        Descrição
                                    </div>
                                    <div className="text-sm text-gray-700 truncate">
                                        {ticket.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de detalhes do ticket */}
                {selectedTicket && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white border-2 border-black max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                            <div className="p-6">
                                <div className="absolute top-4 right-4 w-2 h-2 bg-red-600 rounded-full animate-pulse" />

                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="absolute top-6 right-10 text-xl font-bold hover:text-red-600"
                                >
                                    ×
                                </button>

                                <h2 className="text-xl font-bold uppercase mb-4">
                                    TICKET #{selectedTicket.id}
                                </h2>
                                <div className="w-16 h-1 bg-black mb-6" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">
                                            Prioridade
                                        </label>
                                        <div
                                            className={getPriorityColor(
                                                selectedTicket.priority
                                            )}
                                        >
                                            {getPriorityText(
                                                selectedTicket.priority
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">
                                            Status API
                                        </label>
                                        <div
                                            className={getStatusColor(
                                                selectedTicket.external_status
                                            )}
                                        >
                                            {selectedTicket.external_status ||
                                                'PENDENTE'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">
                                            Criado em
                                        </label>
                                        <div>
                                            {formatDate(
                                                selectedTicket.created_at
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">
                                            Status ATR
                                        </label>
                                        <div
                                            className={
                                                selectedTicket.atr_response
                                                    ? 'text-green-600 font-bold'
                                                    : 'text-gray-500'
                                            }
                                        >
                                            {selectedTicket.atr_response
                                                ? 'RESPONDIDO'
                                                : 'SEM RESPOSTA AINDA'}
                                        </div>
                                    </div>

                                    {selectedTicket.atr_received_at && (
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase">
                                                ATR respondido em
                                            </label>
                                            <div>
                                                {formatDate(
                                                    selectedTicket.atr_received_at
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">
                                            Título
                                        </label>
                                        <div className="font-bold">
                                            {selectedTicket.label}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">
                                            Descrição
                                        </label>
                                        <div className="whitespace-pre-wrap">
                                            {selectedTicket.description}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">
                                            Valor
                                        </label>
                                        <div>{selectedTicket.value}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase">
                                                Recurso
                                            </label>
                                            <div className="font-mono text-xs">
                                                {selectedTicket.rsource}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500 uppercase">
                                                Sub-recurso
                                            </label>
                                            <div className="font-mono text-xs">
                                                {selectedTicket.sub_resource}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedTicket.event_id && (
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase">
                                                Event ID
                                            </label>
                                            <div className="font-mono text-sm font-bold text-blue-600">
                                                {selectedTicket.event_id}
                                            </div>
                                        </div>
                                    )}

                                    {selectedTicket.external_response && (
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase">
                                                Resposta Externa
                                            </label>
                                            <pre className="text-xs bg-gray-50 p-2 border border-gray-300 overflow-auto">
                                                {JSON.stringify(
                                                    selectedTicket.external_response,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">
                                            Resposta ATR
                                        </label>
                                        {selectedTicket.atr_response ? (
                                            <pre className="text-xs bg-green-50 p-2 border border-green-300 overflow-auto">
                                                {JSON.stringify(
                                                    selectedTicket.atr_response,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        ) : (
                                            <div className="text-sm text-gray-500 italic p-2 border border-gray-300 bg-gray-50">
                                                SEM RESPOSTA AINDA
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
