const API_URL = 'https://taskmanager-genwizard.onrender.com'

interface LoginData {
    email: string
    password: string
}

interface RegisterData {
    name: string
    email: string
    password: string
}

interface User {
    id: number
    name: string
    email: string
    created_at: string
}

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

interface CreateTicketData {
    priority: string
    label: string
    description: string
    value: string
    userId?: number
}

interface TicketsResponse {
    success: boolean
    tickets: Ticket[]
    total: number
}

interface CreateTicketResponse {
    success: boolean
    message: string
    ticketId: number
    eventId?: string
    status: number
    data: any
}

interface LoginResponse {
    message: string
    user: User
}

interface RegisterResponse {
    message: string
    userId: number
}

interface ErrorResponse {
    error: string
}

class ApiService {
    private baseUrl: string

    constructor(baseUrl: string = API_URL) {
        this.baseUrl = baseUrl
    }

    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    (data as ErrorResponse).error ||
                        'Erro ao processar requisição'
                )
            }

            return data as T
        } catch (error) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error('Erro desconhecido ao fazer requisição')
        }
    }

    async login(credentials: LoginData): Promise<LoginResponse> {
        return this.request<LoginResponse>('/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        })
    }

    async register(userData: RegisterData): Promise<RegisterResponse> {
        return this.request<RegisterResponse>('/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        })
    }

    async getUsers(): Promise<User[]> {
        return this.request<User[]>('/users', {
            method: 'GET',
        })
    }

    async createTicket(
        ticketData: CreateTicketData
    ): Promise<CreateTicketResponse> {
        return this.request<CreateTicketResponse>('/tickets', {
            method: 'POST',
            body: JSON.stringify(ticketData),
        })
    }

    async getTickets(userId?: number): Promise<TicketsResponse> {
        const params = userId ? `?userId=${userId}` : ''
        return this.request<TicketsResponse>(`/tickets${params}`, {
            method: 'GET',
        })
    }

    async updateTicketATR(
        shortDescription: string,
        atrResponse: any
    ): Promise<any> {
        return this.request(`/tickets/atr`, {
            method: 'POST',
            body: JSON.stringify({
                short_description: shortDescription,
                atrResponse,
            }),
        })
    }
}

// Exporta uma instância única do serviço
const apiService = new ApiService()

export default apiService

// Exporta os tipos para uso em outros arquivos
export type {
    LoginData,
    RegisterData,
    User,
    LoginResponse,
    RegisterResponse,
    Ticket,
    CreateTicketData,
    TicketsResponse,
    CreateTicketResponse,
}
