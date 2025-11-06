require('dotenv').config()

const sqlite3 = require('sqlite3').verbose()
const { open } = require('sqlite')
const path = require('path')
const bcrypt = require('bcrypt')
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const https = require('https')
const crypto = require('crypto')

const app = express()

// Função para gerar UUID v4
function generateUUID() {
    return crypto.randomUUID()
}

// Configuração do CORS - permite qualquer origem
app.use(
    cors({
        origin: true, // Permite qualquer origem
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true,
    })
)

app.use(express.json())

let db

// Inicializa o banco de dados
async function initDB() {
    const dbPath = path.join(__dirname, 'data.db')
    db = await open({ filename: dbPath, driver: sqlite3.Database })

    // cria tabela de usuários com senha
    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

    // cria tabela de tickets para persistir chamados enviados
    await db.exec(`
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            priority TEXT,
            label TEXT,
            description TEXT,
            value TEXT,
            rsource TEXT,
            sub_resource TEXT,
            origin TEXT,
            env TEXT,
            tower TEXT,
            problem_type TEXT,
            event_id TEXT,
            external_status INTEGER,
            external_response TEXT,
            atr_response TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            atr_received_at DATETIME,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `)

    console.log('Banco de dados inicializado')
}

// Função para hash da senha
async function hashPassword(password) {
    const saltRounds = 10
    return await bcrypt.hash(password, saltRounds)
}

// Função para verificar senha
async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
}

// Função para adicionar usuário com senha criptografada
async function addUser(name, email, password) {
    try {
        const hashedPassword = await hashPassword(password)
        const result = await db.run(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        )
        return { id: result.lastID, success: true }
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return { success: false, error: 'Email já cadastrado' }
        }
        return { success: false, error: 'Erro ao cadastrar usuário' }
    }
}

// Função para autenticar usuário
async function authenticateUser(email, password) {
    try {
        const user = await db.get('SELECT * FROM users WHERE email = ?', [
            email,
        ])

        if (!user) {
            return { success: false, error: 'Usuário não encontrado' }
        }

        const passwordMatch = await verifyPassword(password, user.password)

        if (!passwordMatch) {
            return { success: false, error: 'Senha incorreta' }
        }

        // Retorna dados do usuário sem a senha
        const { password: _, ...userData } = user
        return { success: true, user: userData }
    } catch (error) {
        return { success: false, error: 'Erro na autenticação' }
    }
}

// Rota para cadastro
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res
            .status(400)
            .json({ error: 'Nome, email e senha são obrigatórios' })
    }

    if (password.length < 6) {
        return res
            .status(400)
            .json({ error: 'Senha deve ter pelo menos 6 caracteres' })
    }

    const result = await addUser(name, email, password)

    if (result.success) {
        res.status(201).json({
            message: 'Usuário cadastrado com sucesso',
            userId: result.id,
        })
    } else {
        res.status(400).json({ error: result.error })
    }
})

// Rota para login
app.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    const result = await authenticateUser(email, password)

    if (result.success) {
        res.json({
            message: 'Login realizado com sucesso',
            user: result.user,
        })
    } else {
        res.status(401).json({ error: result.error })
    }
})

// Rota para listar usuários (apenas para teste - remover em produção)
app.get('/users', async (req, res) => {
    try {
        const users = await db.all(
            'SELECT id, name, email, created_at FROM users'
        )
        res.json(users)
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' })
    }
})

// Rota para criação/encaminhamento de tickets para API externa
app.post('/tickets', async (req, res) => {
    // espera pelo menos: priority, label, description, value
    // opcional: userId para associar ticket a um usuário existente
    const { priority, label, description, value, userId } = req.body

    const URL = process.env.TICKETS_URL
    const KEY = process.env.TICKETS_API_KEY

    if (!URL || !KEY) {
        return res.status(400).json({
            error: 'TICKETS_URL e/ou TICKETS_API_KEY não configurados',
        })
    }

    const trigger_time = Math.floor(Date.now() / 1000).toString()

    // gerar identificadores que serão enviados para a API externa e salvos
    const rsource = generateUUID()
    const sub_resource = generateUUID()

    // Primeiro, salva o ticket no banco sem resposta externa
    try {
        const insert = await db.run(
            `INSERT INTO tickets (
                user_id, priority, label, description, value,
                rsource, sub_resource, origin, env, tower, problem_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId || null,
                priority,
                label,
                description,
                value,
                rsource,
                sub_resource,
                'Campina',
                'DEV',
                'Felipe Nonato',
                'Problem',
            ]
        )

        const savedTicketId = insert.lastID

        const payload = {
            origin: 'Campina',
            SRC_UNIX_CLOCK: trigger_time,
            SRC_PRIORITY: priority,
            SRC_LABEL: label,
            SRC_DESCRIPTION: description,
            SRC_PROBLEM_VALUE: value,
            SRC_RSOURCE: rsource,
            SRC_SUB_RESOURCE: sub_resource,
            SRC_ENV: 'DEV',
            SRC_TOWER: 'Felipe Nonato',
            SRC_PROBLEM_TYPE: 'Problem',
        }

        // permite conexões HTTPS mesmo com certificados autoassinados
        const httpsAgent = new https.Agent({ rejectUnauthorized: false })

        try {
            const response = await axios.post(URL, payload, {
                headers: {
                    'x-api-key': KEY,
                    'Content-Type': 'application/json',
                },
                httpsAgent,
                timeout: 20000,
            })

            // Atualiza o ticket com a resposta externa
            await db.run(
                `UPDATE tickets SET external_status = ?, external_response = ?, event_id = ? WHERE id = ?`,
                [
                    response.status,
                    JSON.stringify(response.data),
                    response.data?.eventId || null,
                    savedTicketId,
                ]
            )

            return res.json({
                success: true,
                message: 'Ticket criado e enviado com sucesso',
                ticketId: savedTicketId,
                eventId: response.data?.eventId,
                status: response.status,
                data: response.data,
            })
        } catch (err) {
            console.error(
                'Erro ao encaminhar ticket:',
                err?.response?.data || err.message || err
            )

            // Atualiza o ticket com o erro
            await db.run(
                `UPDATE tickets SET external_status = ?, external_response = ? WHERE id = ?`,
                [
                    500,
                    JSON.stringify({
                        error: err?.response?.data || err.message,
                    }),
                    savedTicketId,
                ]
            )

            return res.status(500).json({
                success: false,
                message: 'Ticket salvo, mas falha ao enviar para API externa',
                ticketId: savedTicketId,
                error: 'Falha ao enviar ticket',
                details: err?.response?.data || err.message,
            })
        }
    } catch (dbErr) {
        console.error('Erro ao salvar ticket no banco:', dbErr)
        return res.status(500).json({
            success: false,
            error: 'Falha ao salvar ticket no banco de dados',
            details: dbErr.message,
        })
    }
})

// Rota para documentação da API
app.get('/', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation - Task Manager</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px; 
            background: #f8f9fa;
        }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #16a085; }
        .endpoint { 
            background: #ecf0f1; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 15px 0; 
            border-left: 4px solid #3498db;
        }
        .method { 
            background: #27ae60; 
            color: white; 
            padding: 5px 10px; 
            border-radius: 3px; 
            font-weight: bold; 
            display: inline-block;
            margin-right: 10px;
        }
        .method.post { background: #e74c3c; }
        .method.get { background: #27ae60; }
        pre { 
            background: #2c3e50; 
            color: #ecf0f1; 
            padding: 15px; 
            border-radius: 5px; 
            overflow-x: auto;
            font-size: 14px;
        }
        .response { background: #d5f4e6; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .error { background: #fadbd8; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .config { background: #fef9e7; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 40px; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎫 API Documentation - Task Manager</h1>
        
        <div class="config">
            <h2>⚙️ Configuração Rápida</h2>
            <p><strong>Base URL:</strong> <code>http://localhost:${process.env.PORT || 3001}</code></p>
            <p><strong>Scripts de Build:</strong></p>
            <pre>yarn && npm run prepare-env</pre>
        </div>

        <h2>🔐 Autenticação</h2>
        
        <div class="endpoint">
            <span class="method post">POST</span><strong>/register</strong>
            <p>Cadastra um novo usuário</p>
            <pre>{
  "name": "João Silva",
  "email": "joao@exemplo.com", 
  "password": "minhasenha123"
}</pre>
            <div class="response">✅ <strong>Resposta (201):</strong> <code>{"message": "Usuário cadastrado com sucesso", "userId": 1}</code></div>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span><strong>/login</strong>
            <p>Autentica um usuário existente</p>
            <pre>{
  "email": "joao@exemplo.com",
  "password": "minhasenha123"
}</pre>
            <div class="response">✅ <strong>Resposta (200):</strong> Dados do usuário sem senha</div>
        </div>

        <h2>🎫 Tickets</h2>
        
        <div class="endpoint">
            <span class="method post">POST</span><strong>/tickets</strong>
            <p>Cria um novo ticket e envia para API externa</p>
            <pre>{
  "priority": "Alta",
  "label": "Problema no Sistema",
  "description": "Descrição detalhada do problema",
  "value": "Valor ou identificador",
  "userId": 1
}</pre>
            <div class="response">✅ <strong>Resposta (200):</strong> <code>{"success": true, "ticketId": 1, "eventId": "Event-ABC123"}</code></div>
            <div class="error">❌ <strong>Erro (500):</strong> Ticket salvo, mas falha ao enviar para API externa</div>
        </div>

        <div class="endpoint">
            <span class="method get">GET</span><strong>/tickets</strong>
            <p>Lista tickets com filtros opcionais</p>
            <p><strong>Query Parameters:</strong> <code>userId, limit, offset</code></p>
            <p><strong>Exemplo:</strong> <code>/tickets?userId=1&limit=10</code></p>
            <div class="response">✅ <strong>Resposta (200):</strong> Array de tickets com metadata</div>
        </div>

        <div class="endpoint">
            <span class="method post">POST</span><strong>/tickets/atr</strong>
            <p>Atualiza um ticket com resposta ATR</p>
            <pre>{
  "short_description": "Ticket resolvido - Event-ABC123",
  "atrResponse": {
    "status": "resolved",
    "resolution": "Problema solucionado"
  }
}</pre>
            <div class="response">✅ <strong>Resposta (200):</strong> ATR atualizado com sucesso</div>
        </div>

        <h2>👥 Usuários</h2>
        
        <div class="endpoint">
            <span class="method get">GET</span><strong>/users</strong>
            <p>Lista todos os usuários cadastrados (apenas para teste)</p>
            <div class="response">✅ <strong>Resposta (200):</strong> Array de usuários sem senhas</div>
        </div>

        <h2>🧪 Teste Rápido</h2>
        <pre>
# 1. Cadastrar usuário
curl -X POST http://localhost:${process.env.PORT || 3001}/register \\
  -H "Content-Type: application/json" \\
  -d '{"name":"João","email":"joao@test.com","password":"123456"}'

# 2. Fazer login  
curl -X POST http://localhost:${process.env.PORT || 3001}/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"joao@test.com","password":"123456"}'

# 3. Criar ticket
curl -X POST http://localhost:${process.env.PORT || 3001}/tickets \\
  -H "Content-Type: application/json" \\
  -d '{"priority":"Alta","label":"Bug","description":"Erro crítico","value":"TICKET-001","userId":1}'
        </pre>

        <div class="footer">
            <p>📚 Task Manager API | Desenvolvido com Express.js e SQLite</p>
        </div>
    </div>
</body>
</html>
    `
    res.send(html)
})

// Inicializa o servidor
;(async () => {
    try {
        await initDB()

        const PORT = process.env.PORT || 3001
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`)
            console.log(`Acesse: http://localhost:${PORT}`)
        })
    } catch (err) {
        console.error('Erro ao inicializar:', err)
        process.exit(1)
    }
})()

// Rota para listar todos os tickets
app.get('/tickets', async (req, res) => {
    try {
        const { userId, limit = 50, offset = 0 } = req.query

        let query = `
            SELECT id, user_id, priority, label, description, value,
                   rsource, sub_resource, origin, env, tower, problem_type,
                   event_id, external_status, external_response, atr_response,
                   created_at, atr_received_at
            FROM tickets
        `

        const params = []

        if (userId) {
            query += ' WHERE user_id = ?'
            params.push(userId)
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
        params.push(parseInt(limit), parseInt(offset))

        const tickets = await db.all(query, params)

        // Parse JSON responses para facilitar uso no frontend
        const formattedTickets = tickets.map((ticket) => ({
            ...ticket,
            external_response: ticket.external_response
                ? JSON.parse(ticket.external_response)
                : null,
            atr_response: ticket.atr_response
                ? JSON.parse(ticket.atr_response)
                : null,
        }))

        res.json({
            success: true,
            tickets: formattedTickets,
            total: formattedTickets.length,
        })
    } catch (error) {
        console.error('Erro ao buscar tickets:', error)
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar tickets',
            details: error.message,
        })
    }
})

// Rota para receber/atualizar apenas a resposta ATR de um ticket existente
app.post('/tickets/atr', async (req, res) => {
    // aceita { short_description } e { atrResponse }
    const { short_description, atrResponse } = req.body

    console.log('Recebido ATR para short_description:', short_description)
    console.log('ATR Response:', atrResponse)

    if (!short_description) {
        return res
            .status(400)
            .json({ error: 'short_description é obrigatório' })
    }

    // Extrai o eventId da short_description
    // Formato esperado: algo que contenha "Event-XXXXXXXX"
    const eventIdMatch = short_description.match(/Event-[A-Z0-9]+/i)
    const eventId = eventIdMatch ? eventIdMatch[0] : null

    if (!eventId) {
        return res.status(400).json({
            error: 'Não foi possível extrair eventId da short_description',
        })
    }

    console.log('EventId extraído:', eventId)

    try {
        // Busca o ticket pelo eventId
        const ticket = await db.get(
            'SELECT id FROM tickets WHERE event_id = ?',
            [eventId]
        )

        if (!ticket) {
            return res.status(404).json({
                error: 'Ticket não encontrado para o eventId fornecido',
            })
        }

        const update = await db.run(
            `UPDATE tickets SET atr_response = ?, atr_received_at = datetime('now') WHERE event_id = ?`,
            [JSON.stringify(atrResponse || {}), eventId]
        )

        if (update.changes === 0) {
            return res.status(404).json({ error: 'Falha ao atualizar ticket' })
        }

        const updatedTicket = await db.get(
            'SELECT * FROM tickets WHERE event_id = ?',
            [eventId]
        )
        return res.json({
            success: true,
            message: 'ATR atualizado com sucesso',
            eventId: eventId,
            ticket: updatedTicket,
        })
    } catch (err) {
        console.error('Erro ao salvar ATR:', err)
        return res
            .status(500)
            .json({ error: 'Falha ao salvar ATR', details: err.message })
    }
})
