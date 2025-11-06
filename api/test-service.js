// Teste manual do serviço de API
// Execute este arquivo para testar as chamadas da API

const API_URL = 'http://localhost:3001'

async function testApiService() {
    console.log('🧪 Iniciando testes do serviço de API...\n')

    try {
        // Teste 1: Cadastro
        console.log('📝 Teste 1: Cadastro de novo usuário')
        const registerResponse = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Teste Service',
                email: 'service@teste.com',
                password: 'teste123',
            }),
        })

        const registerData = await registerResponse.json()
        console.log('✅ Cadastro:', registerData)
        console.log('')

        // Teste 2: Login
        console.log('🔐 Teste 2: Login com credenciais corretas')
        const loginResponse = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'service@teste.com',
                password: 'teste123',
            }),
        })

        const loginData = await loginResponse.json()
        console.log('✅ Login:', loginData)
        console.log('')

        // Teste 3: Login com senha errada
        console.log('❌ Teste 3: Login com senha incorreta')
        const wrongLoginResponse = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'service@teste.com',
                password: 'senhaerrada',
            }),
        })

        const wrongLoginData = await wrongLoginResponse.json()
        console.log(
            `${wrongLoginResponse.ok ? '✅' : '⚠️'} Resposta:`,
            wrongLoginData
        )
        console.log('')

        // Teste 4: Listar usuários
        console.log('👥 Teste 4: Listar todos os usuários')
        const usersResponse = await fetch(`${API_URL}/users`)
        const usersData = await usersResponse.json()
        console.log('✅ Usuários:', usersData)
        console.log('')

        // Teste 5: Verificar estrutura de resposta
        console.log('🔍 Teste 5: Verificação de tipos')
        console.log('- Login retorna user:', loginData.user ? '✅' : '❌')
        console.log('- User tem id:', loginData.user?.id ? '✅' : '❌')
        console.log('- User tem name:', loginData.user?.name ? '✅' : '❌')
        console.log('- User tem email:', loginData.user?.email ? '✅' : '❌')
        console.log(
            '- User NÃO tem password:',
            !loginData.user?.password ? '✅' : '❌'
        )
        console.log('')

        console.log('🎉 Todos os testes concluídos!')
    } catch (error) {
        console.error('💥 Erro nos testes:', error)
    }
}

testApiService()
